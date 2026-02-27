const META_API_URL = "https://graph.facebook.com/v19.0";

export async function getInstagramAccounts(accessToken: string) {
  const response = await fetch(
    `${META_API_URL}/me/accounts?access_token=${accessToken}`
  );
  return response.json();
}

export async function createMediaContainer(
  instagramAccountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
) {
  const response = await fetch(
    `${META_API_URL}/${instagramAccountId}/media?image_url=${encodeURIComponent(
      imageUrl
    )}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`,
    { method: "POST" }
  );
  return response.json();
}

export async function publishMedia(
  instagramAccountId: string,
  accessToken: string,
  creationId: string
) {
  const response = await fetch(
    `${META_API_URL}/${instagramAccountId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  return response.json();
}

export async function getContainerStatus(
  creationId: string,
  accessToken: string
) {
  const response = await fetch(
    `${META_API_URL}/${creationId}?fields=status_code,status&access_token=${accessToken}`
  );
  return response.json();
}
