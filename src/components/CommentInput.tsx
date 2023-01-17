import React, { ReactNode, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { userState } from '../recoil/atoms/user';
import { PostResponse } from '../types/response';
import { COLOR } from '../utils/color';
import { createComment } from '../utils/comment';
import { sendNotification } from '../utils/notification';

interface CommentInputProps extends Pick<PostResponse, '_id' | 'author'> {
  fetchHandler?: () => Promise<void>;
}

interface FormProps {
  children: ReactNode[];
  isFocus: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const CommentInput = ({ _id, author, fetchHandler }: CommentInputProps) => {
  const [comment, setComment] = useState('');
  const [user, setUser] = useRecoilState(userState);
  const [isFocus, setIsFocus] = useState(false);

  const onInputFocus = () => setIsFocus(true);

  const onInputBlur = () => setIsFocus(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    content: string,
    postId: string
  ) => {
    e.preventDefault();
    try {
      const data = await createComment(content, postId);
      sendNotification('COMMENT', data._id, author._id, postId);
      setUser({ ...user, comments: [...user.comments, data] });
      if (fetchHandler) fetchHandler();
      setComment('');
    } catch (error) {
      console.error('댓글 등록에 실패하였습니다.');
    }
  };

  return (
    <Container>
      <Form isFocus={isFocus} onSubmit={(e) => onSubmit(e, comment, _id)}>
        <Input
          type="text"
          value={comment}
          placeholder="디깅을 시작해보세요!"
          onChange={onChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        <Button>디깅</Button>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${COLOR.white};
  width: 50%;
  position: fixed;
  bottom: 0;
  padding-top: 1rem;
  padding-bottom: 2rem;
  border-radius: 1rem 1rem 0 0;
  box-shadow: 0px -6px 3px rgba(4, 4, 4, 0.11);
  @media screen and (max-width: 767px) and (orientation: portrait) {
    width: 100%;
  }
`;

const Form = styled.form<FormProps>`
  background-color: ${COLOR.white};
  width: 90%;
  margin: 0 auto;
  display: flex;
  padding: 1.2rem 1rem;
  border-radius: 23.5px;
  align-items: center;
  justify-content: space-between;
  gap: 1.3rem;
  border: 1px solid;
  min-height: 20r;
  box-sizing: border-box;
  border-color: ${({ isFocus }) =>
    isFocus ? COLOR.lightBrown : COLOR.lightGray};
`;

const Input = styled.input`
  width: 100%;
  border: none;
  outline: none;
  letter-spacing: -0.01em;
  color: ${COLOR.lightBrown};
  font-weight: 400;
  font-size: 1.2rem;
  line-height: 1.6rem;
  padding: 0;
  padding-left: 1rem;

  ::placeholder {
    color: ${COLOR.brownGray};
    line-height: 1rem;
  }
`;

const Button = styled.button`
  width: 10%;
  font-weight: 700;
  font-size: 0.8rem;
  line-height: 1.4rem;
  letter-spacing: -0.01em;
  color: ${COLOR.brown};
  cursor: pointer;
`;

export default CommentInput;
