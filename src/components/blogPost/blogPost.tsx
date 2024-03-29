import React, { FunctionComponent } from "react";
import { format } from "date-fns";
import Image, { FluidObject } from "gatsby-image";
import { Layout } from "../layout";
import { Newsletter } from "../newsletter";
import { useSiteMetadata } from "../hooks/useSiteMetadata";

interface BlogPost {
  title: string;
  slug: string;
  tags: string[];
  img: FluidObject;
  imgAlt?: string;
  publishedDate: Date;
}

export const BlogPost: FunctionComponent<BlogPost> = ({
  title,
  slug,
  tags,
  img,
  imgAlt,
  publishedDate,
  children,
}) => {
  const { siteUrl } = useSiteMetadata();
  return (
    <Layout>
      <div className="">
        <h1 className="text-3xl sm:text-5xl text-center font-semibold mt-8 mb-2">
          {title}
        </h1>
        <div className="text-center mb-3 text-gray-500">
          {format(publishedDate, "dd MMM, yyyy")}
        </div>
        <div className="text-center mb-3 text-gray-500">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm leading-5 font-medium text-indigo-600 mx-2 inline-block"
            >
              <a href={`/tags/${tag}`}>#{tag}</a>
            </span>
          ))}
        </div>
        <Image fluid={img} alt={imgAlt || title} className="w-full" />
        {imgAlt && (
          <div className="text-center my-2 text-gray-500">{imgAlt}</div>
        )}
        <div className="flex justify-center">
          <div className="sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg max-w-full">
            <div className="prose sm:prose-lg md:prose-xl text-gray-700 break-words">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Newsletter />
    </Layout>
  );
};
