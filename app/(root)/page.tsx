import { currentUser } from "@clerk/nextjs";

import { fetchPosts } from "@/lib/actions/scream.actions";
import ScreamCard from "@/components/cards/ScreamCard";

export default async function Home() {
  const user = await currentUser();

  const result = await fetchPosts(1, 30);

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">Oops!! No Screams to show!!</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ScreamCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  )
}