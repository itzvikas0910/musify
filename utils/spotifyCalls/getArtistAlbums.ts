import { ACCESS_TOKEN_COOKIE } from "utils/constants";
import { takeCookie } from "utils/cookies";

export enum Include_groups {
  album = "album",
  single = "single",
  appears_on = "appears_on",
  compilation = "compilation",
}

export async function getArtistAlbums(
  id: string,
  market: string,
  include_groups: Include_groups,
  accessToken?: string,
  cookies?: string
): Promise<SpotifyApi.ArtistsAlbumsResponse | null> {
  if (!id) {
    return null;
  }
  const res = await fetch(
    `https://api.spotify.com/v1/artists/${id}/albums?include_groups=${include_groups}&market=${market}`,
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
    const data = (await res.json()) as SpotifyApi.ArtistsAlbumsResponse;
    return data;
  }
  return null;
}
