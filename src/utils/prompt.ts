export function buildGeminiUrl(videoUrl: string): string {
  const prompt = `Voici une vidéo YouTube : ${videoUrl}

Génère un résumé structuré en français avec :
1. Une introduction présentant le sujet et le contenu de la vidéo
2. Les points clés avec les horodatages correspondants
3. Une conclusion résumant les idées principales

Réponds entièrement en français.`;

  const encodedPrompt = encodeURIComponent(prompt);
  return `https://gemini.google.com/app?prompt=${encodedPrompt}`;
}
