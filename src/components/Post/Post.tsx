import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import useGetMyInfo from '../../hooks/useGetMyInfo';
import useModal from '../../hooks/useModal';
import useToast from '../../hooks/useToast';
import { tokenState, userState } from '../../recoil/atoms/user';
import { PostResponse } from '../../types/response';
import { COLOR } from '../../utils/color';
import { formatDate } from '../../utils/formatDate';
import { createLike, deleteLike } from '../../utils/api/like';
import { sendNotification } from '../../utils/api/notification';
import { deletePost } from '../../utils/api/post';
import { ROUTES } from '../../utils/routes';
import Divider from './../Base/Divider';
import Icon from './../Base/Icon';
import Image from '../Base/Image';
import {
  CONFIRM_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../../utils/messages';

interface PostProps extends PostResponse {
  checkIsMine?: boolean;
  isDetailPage?: boolean;
  isMyLikes?: boolean;
}

interface PostDetailProps {
  isDetailPage?: boolean;
}

interface FlexContainerProps {
  direction?: 'row' | 'column';
  color?: string;
}

interface ImageContainerProps {
  width?: string;
  height?: string;
  isMyLikes?: boolean;
}

const Post = ({
  _id,
  title,
  createdAt,
  author,
  likes,
  comments,
  image,
  checkIsMine = false,
  isDetailPage = false,
  isMyLikes = false,
  ...props
}: PostProps) => {
  const user = useRecoilValue(userState);
  const token = useRecoilValue(tokenState);
  const [likesState, setLikesState] = useState(likes);
  const { showToast } = useToast();
  const { showModal } = useModal();
  const getMyInfo = useGetMyInfo();
  const navigate = useNavigate();
  const postContent = title[0] === '{' ? JSON.parse(title) : title;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.host}/posts/${_id}`);
    showToast({ message: SUCCESS_MESSAGES.SHARE_SUCCESS });
  };

  const toUserProfile = () => {
    const userId = author._id === user._id ? 'me' : author._id;
    navigate(ROUTES.PROFILE_BY_USER_ID(userId));
  };

  const toPostDetail = () => {
    navigate(ROUTES.POSTS_BY_ID(_id));
  };

  const handleDelete = async () => {
    showModal({
      message: CONFIRM_MESSAGES.DELETE_CONFIRM,
      handleConfirm: async () => {
        try {
          await deletePost(_id);
          navigate(ROUTES.HOME);
          showToast({ message: SUCCESS_MESSAGES.DELETE_SUCCESS('그라운드가') });
        } catch (error) {
          console.error(error);
          showToast({ message: ERROR_MESSAGES.SERVER_ERROR });
        }
      },
    });
  };

  const handleEdit = () => {
    navigate(ROUTES.POSTS_EDIT_BY_ID(_id));
  };

  const handleLike = async () => {
    const isLike = likesState.findIndex((like) => like.user === user._id);
    if (!token) {
      return showToast({ message: ERROR_MESSAGES.REQUIRE_LOGIN });
    }

    if (isLike === -1) {
      try {
        const { data } = await createLike(_id);
        setLikesState([...likesState, data]);
        await getMyInfo();
        sendNotification('LIKE', data._id, author._id, _id);
        showToast({ message: SUCCESS_MESSAGES.LIKE_SUCCESS });
      } catch (error) {
        console.error(error);
        showToast({ message: ERROR_MESSAGES.SERVER_ERROR });
      }
    } else {
      try {
        setLikesState(
          likesState.filter((item) => item._id !== likesState[isLike]._id)
        );
        deleteLike(likesState[isLike]._id);
        if (user.likes) {
          getMyInfo();
        }
        showToast({ message: SUCCESS_MESSAGES.UNLIKE_SUCCESS });
      } catch (error) {
        console.log(error);
        showToast({ message: ERROR_MESSAGES.SERVER_ERROR });
      }
    }
  };

  return (
    <Container {...props}>
      <PostHeader>
        <Wrapper onClick={toUserProfile}>
          {author.image ? (
            <ProfileImage src={author.image} alt="author" />
          ) : (
            <Icon name="default-profile" size={28} />
          )}
          <UserName>{author.fullName}</UserName>
          <Divider type="vertical" size={0.5} />
          <Date>{formatDate.fullDate(createdAt)}</Date>
        </Wrapper>
        <Wrapper>
          <Button onClick={handleShare}>
            <Icon name="share" size={16} />
          </Button>
        </Wrapper>
      </PostHeader>
      {isMyLikes ? (
        <FlexContainer
          direction="row"
          color={COLOR.white}
          onClick={toPostDetail}
        >
          {image && (
            <ImageContainer isMyLikes={isMyLikes}>
              <Image src={image} alt="post-image" />
            </ImageContainer>
          )}
          <FlexContainer direction="column">
            <Title>
              {typeof postContent === 'string'
                ? postContent
                : postContent.title}
            </Title>
            <Text>
              {typeof postContent === 'string' ? postContent : postContent.body}
            </Text>
            <Footer>
              {likesState.find((like) => like.user === user._id) ? (
                <IconWrapper>
                  <Button onClick={handleLike}>
                    <Icon name="liked" width={18} height={16} />
                  </Button>
                  <SmText>{likesState.length}</SmText>
                </IconWrapper>
              ) : (
                <IconWrapper>
                  <Button onClick={handleLike}>
                    <Icon name="unliked" width={18} height={16} />
                  </Button>
                  {likesState.length > 999 ? (
                    <SmText>999+</SmText>
                  ) : (
                    <SmText>{likesState.length}</SmText>
                  )}
                </IconWrapper>
              )}
              <IconWrapper>
                <Button onClick={toPostDetail}>
                  <Icon name="comment" width={18} height={16} />
                </Button>
                {comments.length > 999 ? (
                  <SmText>999+</SmText>
                ) : (
                  <SmText>{comments.length}</SmText>
                )}
              </IconWrapper>
            </Footer>
          </FlexContainer>
        </FlexContainer>
      ) : (
        <Section onClick={toPostDetail}>
          <Title>
            {typeof postContent === 'string' ? postContent : postContent.title}
          </Title>
          {image && (
            <ImageContainer width="100%">
              <Image src={image} alt="post-image" objectFit="contain" />
            </ImageContainer>
          )}
          <Text>
            {typeof postContent === 'string' ? postContent : postContent.body}
          </Text>
        </Section>
      )}
      {checkIsMine && user._id === author._id ? (
        <Footer>
          <IconContainer>
            <StyledDiv>
              {likesState.find((like) => like.user === user._id) ? (
                <IconWrapper>
                  <Button onClick={handleLike}>
                    <Icon name="liked" width={18} height={16} />
                  </Button>
                  <SmText>{likesState.length}</SmText>
                </IconWrapper>
              ) : (
                <IconWrapper>
                  <Button onClick={handleLike}>
                    <Icon name="unliked" width={18} height={16} />
                  </Button>
                  {likesState.length > 999 ? (
                    <SmText>999+</SmText>
                  ) : (
                    <SmText>{likesState.length}</SmText>
                  )}
                </IconWrapper>
              )}
              <IconWrapper>
                <Button onClick={toPostDetail}>
                  <Icon name="comment" width={18} height={16} />
                </Button>
                {comments.length > 999 ? (
                  <SmText>999+</SmText>
                ) : (
                  <SmText>{comments.length}</SmText>
                )}
              </IconWrapper>
            </StyledDiv>
            <StyledDiv>
              <IconWrapper>
                <Button onClick={handleDelete}>
                  <Icon name="delete" size={16} />
                </Button>
              </IconWrapper>
              <IconWrapper>
                <Button onClick={handleEdit}>
                  <Icon name="edit" size={20} />
                </Button>
              </IconWrapper>
            </StyledDiv>
          </IconContainer>
        </Footer>
      ) : (
        !isMyLikes && (
          <Footer>
            {likesState.find((like) => like.user === user._id) ? (
              <IconWrapper>
                <Button onClick={handleLike}>
                  <Icon name="liked" width={18} height={16} />
                </Button>
                <SmText>{likesState.length}</SmText>
              </IconWrapper>
            ) : (
              <IconWrapper>
                <Button onClick={handleLike}>
                  <Icon name="unliked" width={18} height={16} />
                </Button>
                {likesState.length > 999 ? (
                  <SmText>999+</SmText>
                ) : (
                  <SmText>{likesState.length}</SmText>
                )}
              </IconWrapper>
            )}
            <IconWrapper>
              <Button onClick={toPostDetail}>
                <Icon name="comment" width={18} height={16} />
              </Button>
              {comments.length > 999 ? (
                <SmText>999+</SmText>
              ) : (
                <SmText>{comments.length}</SmText>
              )}
            </IconWrapper>
          </Footer>
        )
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 2rem 0;

  @media screen and (max-width: 767px) and (orientation: portrait) {
    margin: 1.3rem auto;
    width: 90%;
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 0.6rem 1.5rem 0.3rem;
  margin: 0 auto;
`;

const Section = styled.div`
  background-color: ${COLOR.white};
  padding: 1rem 2rem;

  @media screen and (max-width: 767px) and (orientation: portrait) {
    padding: 1rem 1.5rem;
  }
`;

const FlexContainer = styled.div<FlexContainerProps>`
  display: flex;
  flex-direction: ${({ direction }) =>
    direction === 'column' ? 'column' : 'row'};
  background-color: ${({ color }) => color};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 1.4rem 1.2rem;
`;

const detailBody = `
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const detailsTitle = `
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Title = styled.span<PostDetailProps>`
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 2.5rem;
  letter-spacing: -0.01em;
  color: ${COLOR.brown};
  margin: 0.5rem 0 1.5rem;
  word-break: break-all;
  ${({ isDetailPage }) => (isDetailPage ? '' : detailsTitle)};
`;

const Text = styled.div<PostDetailProps>`
  font-weight: 500;
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 1rem 0 0.5rem;
  letter-spacing: -0.01em;
  color: ${COLOR.brown};
  word-break: break-all;
  ${({ isDetailPage }) => (isDetailPage ? '' : detailBody)};
`;

const SmText = styled.span`
  font-weight: 400;
  font-size: 1.1rem;
  line-height: 1.4rem;
  letter-spacing: -0.01em;
  color: ${COLOR.brown};
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:first-child {
    margin-right: 1.2rem;
  }
`;

const StyledDiv = styled.div`
  display: flex;
`;

const IconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  display: flex;
  cursor: pointer;
`;

const UserName = styled.span`
  font-weight: 500;
  font-size: 1.5rem;
  line-height: 2rem;
  letter-spacing: -0.01em;
  color: ${COLOR.lightBrown};
`;

const Date = styled.span`
  font-weight: 400;
  font-size: 1.2rem;
  line-height: 2rem;
  letter-spacing: -0.01em;
  color: ${COLOR.date};
`;

const ProfileImage = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-right: 0.4rem;
  object-fit: cover;
`;

const ImageContainer = styled.div<ImageContainerProps>`
  position: relative;
  display: inline-block;
  overflow: hidden;
  width: ${({ width }) => width ?? '10rem'};
  min-width: 10rem;
  aspect-ratio: 1 / 1;
  background-color: #fafafa;
  border-radius: ${({ isMyLikes }) => (isMyLikes ? 0 : '15px')};
  margin-right: ${({ isMyLikes }) => (isMyLikes ? '1.5rem' : 0)};
`;

export default Post;
