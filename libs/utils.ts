import numeral from 'numeral';
import { showError } from './toast';

export const formatterStr = (value: number | undefined): string => {
  return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetPropertyHandler = async (likeTargetProperty: any, id: string) => {
  try {
    await likeTargetProperty({
      variables: {
        input: id,
      },
    });
  } catch (err: any) {
    console.log('ERROR, likeTargetPropertyHandler:', err.message);
    showError(err.message || 'An error occurred');
  }
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
  try {
    await likeTargetBoardArticle({
      variables: {
        input: id,
      },
    });
  } catch (err: any) {
    console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
    showError(err.message || 'An error occurred');
  }
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
  try {
    await likeTargetMember({
      variables: {
        input: id,
      },
    });
  } catch (err: any) {
    console.log('ERROR, likeTargetMemberHandler:', err.message);
    showError(err.message || 'An error occurred');
  }
};
