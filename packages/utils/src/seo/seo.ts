export const seo = ({
  title,
  description,
  keywords,
  image,
  twitterHandle,
}: {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
  twitterHandle?: string;
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },

    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...(twitterHandle
      ? [
          { name: "twitter:creator", content: twitterHandle },
          { name: "twitter:site", content: twitterHandle },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
        ]
      : []),
    ...(image ? [{ name: "og:image", content: image }] : []),
    ...(image && twitterHandle
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : []),
  ];

  return tags;
};
