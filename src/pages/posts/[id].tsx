import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type NextPage } from "next";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Potato-x</title>
        <meta name="description" content="Generated by create-t3-app" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main className="flex h-screen justify-center">
        <div>Profile</div>
      </main>
    </>
  );
};

export default SinglePostPage;
