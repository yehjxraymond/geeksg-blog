import React, { FunctionComponent } from "react";
import { graphql } from "gatsby";
import { ImageDataLike } from "gatsby-plugin-image";
import { BlogPost } from "../../components/blogPost";
import { SEO } from "../../components/seo";

interface QueryData {
  markdownRemark: {
    html: string;
    fields: {
      slug: string;
    };
    frontmatter: {
      title: string;
      tags: string[];
      img: {
        childImageSharp: ImageDataLike;
      };
      imgAlt: string;
      publishedDate: string;
      description: string;
    };
  };
}

export const pageQuery = graphql`
  query BlogPostByID($id: String!, $tag: [String!]) {
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      fields {
        slug
      }
      frontmatter {
        title
        description
        tags
        img {
          childImageSharp {
            gatsbyImageData(width: 2400)
          }
        }
        imgAlt
        publishedDate
      }
    }
    allMarkdownRemark(
      limit: 3
      sort: { fields: [frontmatter___publishedDate], order: DESC }
      filter: { frontmatter: { tags: { in: $tag } }, id: { ne: $id } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            description
            tags
            img {
              childImageSharp {
                gatsbyImageData(width: 370)
              }
            }
          }
        }
      }
    }
  }
`;

interface Page {
  data: QueryData;
}

export const Page: FunctionComponent<Page> = ({ data }) => {
  const {
    markdownRemark: {
      fields: { slug },
      html,
      frontmatter: {
        title,
        tags,
        imgAlt,
        description,
        img: { childImageSharp },
        publishedDate,
      },
    },
  } = data;

  return (
    <>
      <SEO title={title} description={description} />
      <BlogPost
        title={title}
        tags={tags}
        slug={slug}
        img={childImageSharp}
        imgAlt={imgAlt}
        publishedDate={new Date(publishedDate)}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </BlogPost>
    </>
  );
};

export default Page;
