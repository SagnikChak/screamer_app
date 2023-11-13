import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ScreamCard from "../cards/ScreamCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const ScreamsTab = async ({ currentUserId, accountId, accountType }: Props) => {
    let result: any;

    if(accountType === "Community") {
        result = await fetchCommunityPosts(accountId);
    } else {
        result = await fetchUserPosts(accountId);
    }


  if(!result) redirect('/');
  
  return (
    <section className="mt-9 flex flex-col gap-10">
        {result.screams.map((scream: any) => (
            <ScreamCard
                key={scream._id}
                id={scream._id}
                currentUserId={currentUserId}
                parentId={scream.parentId}
                content={scream.text}
                author={
                    accountType === 'User'
                        ? { name: result.name, image: result.image, id: result.id }
                        : { name: scream.author.name, image: scream.author.image, id: scream.author.id }
                }
                community={scream.community} // todo
                createdAt={scream.createdAt}
                comments={scream.children}
            />
        ))}
    </section>
  );
};

export default ScreamsTab;