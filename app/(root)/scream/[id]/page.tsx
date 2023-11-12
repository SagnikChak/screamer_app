import ScreamCard from "@/components/cards/ScreamCard";
import Comment from "@/components/forms/Comment";
import { fetchScreamById } from "@/lib/actions/scream.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    const scream = await fetchScreamById(params.id);

  return (
    <section className="relative">
        <div>
            <ScreamCard
                key={scream._id}
                id={scream._id}
                currentUserId={user?.id || ""}
                parentId={scream.parentId}
                content={scream.text}
                author={scream.author}
                community={scream.community}
                createdAt={scream.createdAt}
                comments={scream.children}
            />
        </div>

        <div className="mt-7">
            <Comment
                screamId={scream.id}
                currentUserImg={userInfo.image}
                currentUserId={JSON.stringify(userInfo._id)}
            />
        </div>

        <div className="mt-10">
            {scream.children.map((childItem: any) => (
                <ScreamCard
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={childItem?.id || ""}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={childItem.author}
                    community={childItem.community}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    isComment
                />
            ))}
        </div>
    </section>
  )
}

export default Page