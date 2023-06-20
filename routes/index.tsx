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
          class="bg-gray-200 rounded-xl p-2"
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

        {data.image
          ? <img class="w-96" src={data.image} />
          : (
            <p class="text-red-500">
              An error occured loading the image. Please try again later
            </p>
          )}
        {data.prompt && <p class="text-gray-500 italic">{data.prompt}</p>}
      </form>
    </>
  );
}
