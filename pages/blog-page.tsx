import { GetStaticProps } from 'next'
import Layout from '../components/Layout'
import { getAllPostsData } from '../lib/fetch'
import Post from '../components/Post'
import { POST } from '../types/Types'

interface STATIC_PROPS {
  posts: POST[]
}

const BlogPage: React.FC<STATIC_PROPS> = ({ posts }) => {
  return (
    <Layout title="Blog">
      <p className="text-4xl mb-10">blog page</p>
      <ul>{posts && posts.map((post) => <Post key={post.id} {...post} />)}</ul>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllPostsData()
  return {
    props: { posts },
  }
}

export default BlogPage
