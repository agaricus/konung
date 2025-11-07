import { define } from "@/utils.ts";
import { Head } from "fresh/runtime";
import MiniApp from "@/islands/MiniApp.tsx";

export default define.page(function MiniAppPage() {
  return (
    <>
      <Head>
        <title>Telegram MiniApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <MiniApp />
    </>
  );
});
