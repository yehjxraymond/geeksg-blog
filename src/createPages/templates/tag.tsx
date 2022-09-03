import React, { FunctionComponent } from "react";
import { graphql } from "gatsby";
import { IGatsbyImageData } from "gatsby-plugin-image";
import { Layout } from "../../components/layout";
import { TagCollection } from "../../components/tagCollection";
import { PostSnippet } from "../../types";
import { SEO } from "../../components/seo";

interface Post {
  node: {
    fields: {
      slug: string;
    };
    frontmatter: {
      title: string;
      description: string;
      tags: string[];
      img: { childImageSharp: { fluid: IGatsbyImageData } };
      imgAlt: string;
      publishedDate: string;
    };
  };
}

export const pageQuery = graphql`
  query BlogPostsWithTag($tag: String!) {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___publishedDate], order: DESC }
      filter: { frontmatter: { tags: { eq: $tag } } }
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
            imgAlt
            publishedDate
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

interface QueryData {
  data: {
    allMarkdownRemark: {
      edges: Post[];
    };
  };
  pageContext: {
    tag: string;
  };
}

export const Page: FunctionComponent<QueryData> = ({ data, pageContext }) => {
  const relatedPost: PostSnippet[] = data.allMarkdownRemark.edges.map(
    ({ node }) => ({
      title: node.frontmatter.title,
      summary: node.frontmatter.description,
      href: node.fields.slug,
      img: node.frontmatter.img.childImageSharp,
      imgAlt: node.frontmatter.imgAlt,
      tags: node.frontmatter.tags,
      publishedDate: new Date(node.frontmatter.publishedDate),
    })
  );
  return (
    <>
      <SEO title={pageContext.tag} />
      <Layout>
        <TagCollection tag={pageContext.tag} relatedPosts={relatedPost} />
      </Layout>
    </>
  );
};

export default Page;
