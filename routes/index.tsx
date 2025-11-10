import { useSignal } from "@preact/signals";
import { Head } from "fresh/runtime";
import { define } from "@/utils/index.ts";
import Counter from "@/islands/Counter.tsx";
import UserProfile from "@/islands/UserProfile.tsx";

export default define.page(function Home(ctx) {
  const count = useSignal(3);

  console.log(`Shared value ${ctx.state.shared}`);

  return (
    <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
      <Head>
        <title>Fresh counter</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Добро пожаловать в MiniApp с аутентификацией через Telegram!
        </p>
        <div class="w-full max-w-md">
          <UserProfile />
        </div>
        <div class="mt-8">
          <Counter count={count} />
        </div>
      </div>
    </div>
  );
});
