"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Scream from "../models/scream.model";
import Community from "../models/community.model";
// import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level screams) (a scream that is not a comment/reply).
  const postsQuery = Scream.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (screams) i.e., screams that are not comments.
  const totalPostsCount = await Scream.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createScream({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdScream = await Scream.create({
      text,
      author,
      community: null, //communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { screams: createdScream._id },
    });

    // if (communityIdObject) {
    //   // Update Community model
    //   await Community.findByIdAndUpdate(communityIdObject, {
    //     $push: { screams: createdScream._id },
    //   });
    // }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create scream: ${error.message}`);
  }
}

// async function fetchAllChildScreams(screamId: string): Promise<any[]> {
//   const childScreams = await Scream.find({ parentId: screamId });

//   const descendantScreams = [];
//   for (const childScream of childScreams) {
//     const descendants = await fetchAllChildScreams(childThread._id);
//     descendantScreams.push(childScream, ...descendants);
//   }

//   return descendantScreams;
// }

// export async function deleteScream(id: string, path: string): Promise<void> {
//   try {
//     connectToDB();

//     // Find the scream to be deleted (the main scream)
//     const mainScream = await Scream.findById(id).populate("author community");

//     if (!mainScream) {
//       throw new Error("Scream not found");
//     }

//     // Fetch all child screams and their descendants recursively
//     const descendantScreams = await fetchAllChildScreams(id);

//     // Get all descendant scream IDs including the main scream ID and child scream IDs
//     const descendantScreamIds = [
//       id,
//       ...descendantScreams.map((scream) => scream._id),
//     ];

//     // Extract the authorIds and communityIds to update User and Community models respectively
//     const uniqueAuthorIds = new Set(
//       [
//         ...descendantScreams.map((scream) => scream.author?._id?.toString()), // Use optional chaining to handle possible undefined values
//         mainScream.author?._id?.toString(),
//       ].filter((id) => id !== undefined)
//     );

//     const uniqueCommunityIds = new Set(
//       [
//         ...descendantScreams.map((scream) => scream.community?._id?.toString()), // Use optional chaining to handle possible undefined values
//         mainScream.community?._id?.toString(),
//       ].filter((id) => id !== undefined)
//     );

//     // Recursively delete child threads and their descendants
//     await Scream.deleteMany({ _id: { $in: descendantScreamIds } });

//     // Update User model
//     await User.updateMany(
//       { _id: { $in: Array.from(uniqueAuthorIds) } },
//       { $pull: { screams: { $in: descendantScreamIds } } }
//     );

//     // Update Community model
//     await Community.updateMany(
//       { _id: { $in: Array.from(uniqueCommunityIds) } },
//       { $pull: { screams: { $in: descendantScreamIds } } }
//     );

//     revalidatePath(path);
//   } catch (error: any) {
//     throw new Error(`Failed to delete scream: ${error.message}`);
//   }
// }

export async function fetchScreamById(screamId: string) {
  connectToDB();

  try {
    const scream = await Scream.findById(screamId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Scream, // The model of the nested children (assuming it's the same "Scream" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return scream;
  } catch (err) {
    console.error("Error while fetching scream:", err);
    throw new Error("Unable to fetch scream");
  }
}

export async function addCommentToScream(
  screamId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original scream by its ID
    const originalScream = await Scream.findById(screamId);

    if (!originalScream) {
      throw new Error("Scream not found");
    }

    // Create the new comment scream
    const commentScream = new Scream({
      text: commentText,
      author: userId,
      parentId: screamId, // Set the parentId to the original scream's ID
    });

    // Save the comment scream to the database
    const savedCommentScream = await commentScream.save();

    // Add the comment scream's ID to the original scream's children array
    originalScream.children.push(savedCommentScream._id);

    // Save the updated original thread to the database
    await originalScream.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
