import React, { FunctionComponent } from "react";
import { graphql } from "gatsby";
import { ImageDataLike } from "gatsby-plugin-image";
import { Layout } from "../../components/layout";
import { PostSnippet } from "../../types";
import { FeaturePosts } from "../../components/featurePosts";
import { RecentPosts } from "../../components/recentPosts";
import { Pagination } from "../../components/pagination";
import { SEO } from "../../components/seo";
import { Newsletter } from "../../components/newsletter";

export const pageQuery = graphql`
  {
    featuredPosts: allMarkdownRemark(
      limit: 4
      sort: { fields: [frontmatter___publishedDate], order: DESC }
      filter: { frontmatter: { featured: { eq: true } } }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            tags
            title
            imgAlt
            description
            publishedDate
            img {
              childImageSharp {
                gatsbyImageData(width: 2400)
              }
            }
          }
        }
      }
    }
    recentPosts: allMarkdownRemark(
      limit: 10
      sort: { fields: [frontmatter___publishedDate], order: DESC }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            tags
            title
            imgAlt
            description
            publishedDate
            img {
              childImageSharp {
                gatsbyImageData(width: 2400)
              }
            }
          }
        }
      }
    }
  }
`;

interface Post {
  node: {
    id: string;
    fields: {
      slug: string;
    };
    frontmatter: {
      tags: string[];
      title: string;
      imgAlt: string;
      description: string;
      publishedDate: string;
      img: { childImageSharp: ImageDataLike };
    };
  };
}

interface QueryData {
  featuredPosts: {
    edges: Post[];
  };
  recentPosts: {
    edges: Post[];
  };
}

interface Home {
  data: QueryData;
}

const Home: FunctionComponent<Home> = ({ data }) => {
  const mapPostData = ({ node }: { node: Post["node"] }) => ({
    title: node.frontmatter.title,
    summary: node.frontmatter.description,
    href: node.fields.slug,
    img: node.frontmatter.img.childImageSharp,
    imgAlt: node.frontmatter.imgAlt,
    tags: node.frontmatter.tags,
    publishedDate: new Date(node.frontmatter.publishedDate),
  });
  const featuredPostData: PostSnippet[] = data.featuredPosts.edges.map(
    mapPostData
  );
  const recentPostData: PostSnippet[] = data.recentPosts.edges.map(mapPostData);
  return (
    <>
      <SEO title="Home" image="/logo.png" />
      <Layout>
        <FeaturePosts featurePosts={featuredPostData} />
        <RecentPosts recentPosts={recentPostData} />
        <Pagination next="/page/2" />
        <Newsletter />
      </Layout>
    </>
  );
};

export default Home;
