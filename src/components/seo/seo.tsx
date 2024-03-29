import React from "react";
import Helmet from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

// https://ogp.me/#types

type Meta = {
  name?: string;
  content: string;
  property?: string;
};

type SEO = {
  description?: string;
  lang?: string;
  meta?: Meta[];
  keywords?: string[];
  title: string;
  type?: "website" | "article" | "blog";
  image?: string;
};

export const SEO: React.FunctionComponent<SEO> = ({
  description,
  lang = "en",
  meta,
  keywords,
  title,
  image,
  type = "website",
}) => {
  const {
    site: { siteMetadata },
  } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            siteUrl
            description
          }
        }
      }
    `
  );

  const imagePath = image
    ? image.startsWith("http://") || image.startsWith("https://")
      ? image
      : new URL(image, siteMetadata.siteUrl).href
    : undefined;

  const metaDescription = description || siteMetadata.description;

  const metaFinal: Meta[] = [
    {
      name: `description`,
      content: metaDescription,
    },
    {
      property: `og:title`,
      content: title,
    },
    {
      property: `og:description`,
      content: metaDescription,
    },
    {
      property: `og:type`,
      content: type,
    },
    {
      name: `twitter:card`,
      content: `summary`,
    },
    {
      name: `twitter:creator`,
      content: siteMetadata.author,
    },
    {
      name: `twitter:title`,
      content: title,
    },
    {
      name: `twitter:description`,
      content: metaDescription,
    },
  ];

  if (keywords && keywords.length) {
    metaFinal.push({
      name: `keywords`,
      content: keywords.join(`, `),
    });
  }

  if (meta) {
    metaFinal.concat(meta);
  }

  if (imagePath) {
    metaFinal.push({
      property: `og:image`,
      content: imagePath,
    });
    metaFinal.push({
      name: `twitter:image`,
      content: imagePath,
    });
  }

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`${title} | ${siteMetadata.title}`}
      meta={metaFinal}
    />
  );
};
