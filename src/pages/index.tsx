import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "./components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;

      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong!");
      }
      setInput("");
    },
  });

  console.log(user);

  if (!user) return null;

  return (
    <div className=" flex w-full">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full border-2 border-blue-400"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="tipe an emoji!"
        className=" m-2 grow bg-transparent p-2 pl-4 outline-none "
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
          if (input !== "") {
            mutate({ content: input });
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => {
            mutate({ content: input });
          }}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className=" flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type postWithUsers = RouterOutputs["posts"]["getAll"][number];
const PostViews = (props: postWithUsers) => {
  const { post, author } = props;
  return (
    <div key={post.id} className=" flex gap-3 border-b-2 border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`${author.username}'s Profile Image`}
        className="h-14 w-14 rounded-full border-2 border-blue-400"
        width={56}
        height={56}
      />
      <div className=" flex flex-col ">
        <div className="flex">
          <Link href={`@${author.username}`}>
            <span className=" font-bold text-slate-400">{`@${author.username}`}</span>
          </Link>
          <Link href={`/posts/${post.id}`}>
            <span className=" pl-1 font-light text-slate-400">
              {` . ${dayjs(post.createdAt).fromNow()}`}
            </span>
          </Link>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

export const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something Went Wrong!</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostViews {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //* Fetch query faster than the page render.
  api.posts.getAll.useQuery();

  //* If both user and posts are loaded, then we can render the page faster.
  if (!userLoaded) return <div />;

  // if (postLoaded) return <LoadingPage />;

  // if (!data) return <div>Something Went Wrong!</div>;

  return (
    <>
      <Head>
        <title>Potato-x</title>
        <meta name="description" content="😶‍🌫️" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex h-full justify-center">
        <UserButton afterSignOutUrl="/" />
        <div className=" h-full w-full border-x-2 border-slate-400 bg-blue-950 md:max-w-2xl">
          <div className=" static flex flex-row justify-between border-b-2 border-slate-400">
            <div className=" right-0 top-0 p-4 ">
              <CreatePostWizard />
            </div>
            {!isSignedIn && (
              <div className=" p-4">
                <SignInButton />
              </div>
            )}
            {!!isSignedIn && (
              <div className=" p-4">
                <SignOutButton />
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
