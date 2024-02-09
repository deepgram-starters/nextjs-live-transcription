// import { IncomingForm } from "formidable";

// export async function POST(request: Request): Promise<Response> {
//   try {
//     // Create a new instance of IncomingForm
//     const form = new IncomingForm();
//     const data = await new Promise((resolve, reject) => {
//       // Parse the request to extract the FormData
//       form.parse(request as any, (err, fields, files) => {
//         if (err) reject(err);
//         resolve({ fields, files });
//       });
//     });

//     // Assuming the audio file is sent as a file named 'audio_file'
//     const { files } = data as { files: { [key: string]: any } };
//     const audioFile = files.audio_file;

//     // Now you can use the audioFile for further processing
//     // For example, sending it to another API or saving it

//     // Placeholder for sending the audio file to another API
//     const runpodResponse = await fetch(`${process.env.RUNPOD_ENDPOINT}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
//       },
//       body: JSON.stringify({
//         input: {
//           // You might need to adjust this part based on how you handle the file
//           audio_file: audioFile, // This is just a placeholder
//         },
//       }),
//     });

//     // Handle the response from the API
//     if (!runpodResponse.ok) {
//       throw new Error(
//         `RunPod API responded with status: ${runpodResponse.status}`
//       );
//     }

//     const responseData = await runpodResponse.json();

//     // Return JSON response to the client
//     return new Response(JSON.stringify(responseData), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     console.error("Failed to fetch audio embedding:", error);
//     return new Response(
//       JSON.stringify({ message: "Failed to fetch audio embedding" }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }
// }
