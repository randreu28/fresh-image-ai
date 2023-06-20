import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { blobToBase64 } from "../lib/utils.ts";

type Data = {
  image: string | null;
  prompt: string | null;
};

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const prompt = url.searchParams.get("prompt");

    if (!prompt) {
      return ctx.render({ prompt: prompt, image: null });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        headers: {
          Authorization: "Bearer " + Deno.env.get("HF_TOKEN"),
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      },
    );
    if (!response.ok) {
      return ctx.render(
        { prompt: prompt, image: null },
        { status: response.status },
      );
    }

    const result = await response.blob();
    const bas64 = await blobToBase64(result);

    return ctx.render({ image: bas64, prompt: prompt });
  },
};

export default function Home({ data }: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Fresh image IA</title>
      </Head>

      <form class="w-screen h-screen flex flex-col justify-center items-center gap-5">
        <h1 class="text-3xl">Text to image generator</h1>
        <p class="text-gray-500">
          Write whatever you want and we will create an image for you!
        </p>
        <input
          class="bg-gray-200 rounded-lg px-4 py-2"
          placeholder="Ej: An astronaut riding a horse"
          required
          name="prompt"
          type="text"
        />
        <button
          type="submit"
          class="px-4 py-1 bg-blue-500 rounded text-white"
        >
          Generate
        </button>

        {data.image ? <img class="w-96" src={data.image} /> : (
          data.prompt !== null && (
            <p class="text-red-500">
              An error occured loading the image. Please try again later
            </p>
          )
        )}
        {data.prompt && <p class="text-gray-500 italic">{data.prompt}</p>}
      </form>

      <a
        href="https://github.com/randreu28/fresh-image-ai"
        target="_blank"
        class="absolute z-10 top-5 right-5"
      >
        <svg
          class="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </>
  );
}
