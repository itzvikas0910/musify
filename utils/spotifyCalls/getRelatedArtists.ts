import { ACCESS_TOKEN_COOKIE } from "utils/constants";
import { takeCookie } from "utils/cookies";

export async function getRelatedArtists(
  id: string,
  accessToken?: string,
  cookies?: string
): Promise<SpotifyApi.ArtistsRelatedArtistsResponse | null> {
  if (!id) {
    return null;
  }
  const res = await fetch(
    `https://api.spotify.com/v1/artists/${id}/related-artists`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          accessToken
            ? accessToken
            : takeCookie(ACCESS_TOKEN_COOKIE, cookies) || ""
        }`,
      },
    }
  );
  if (res.ok) {
    const data = (await res.json()) as SpotifyApi.ArtistsRelatedArtistsResponse;
    return data;
  }
  return null;
}
