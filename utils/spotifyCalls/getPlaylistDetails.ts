import { ACCESS_TOKEN_COOKIE } from "utils/constants";
import { takeCookie } from "utils/cookies";

export async function getPlaylistDetails(
  playlist_id: string,
  accessToken?: string | null,
  cookies?: string | undefined
): Promise<SpotifyApi.SinglePlaylistResponse | null> {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlist_id}?additional_types=track,episode`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          accessToken ?? (takeCookie(ACCESS_TOKEN_COOKIE, cookies) || "")
        }`,
      },
    }
  );
  if (res.ok) {
    const data = (await res.json()) as SpotifyApi.SinglePlaylistResponse;
    return data;
  }
  return null;
}
