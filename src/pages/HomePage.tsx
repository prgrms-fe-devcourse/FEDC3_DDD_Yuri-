import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Post from '../components/Post';
import Header from '../components/Header';
import { PostResponse } from '../types/response';
import { getPosts } from '../utils/post';

const HomePage = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);

  const fetchHandler = useCallback(async () => {
    try {
      const posts = await getPosts();
      setPosts(posts);
    } catch {
      alert('포스트 정보를 불러올 수 없습니다.');
    }
  }, []);

  useEffect(() => {
    fetchHandler();
  }, [fetchHandler]);

  return (
    <Container>
      <Header />
      <List>
        {posts.map((post) => (
          <ListItem key={post._id}>
            <Post {...post} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
`;

const List = styled.ul`
  width: 50%;
  min-width: calc(767px - 10%);
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  box-sizing: border-box;

  @media screen and (max-width: 767px) and (orientation: portrait) {
    width: 90%;
    min-width: 90%;
  }
`;

const ListItem = styled.li`
  width: 100%;
  margin: 0.5rem auto;
`;

export default HomePage;
