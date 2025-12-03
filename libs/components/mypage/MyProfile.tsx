import { UPDATE_MEMBER } from '@/apollo/user/mutation';
import { showError, showSuccess } from '@/libs/toast';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { Messages, REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { MemberUpdate } from '../../types/member/member.update';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
  const device = useDeviceDetect();
  const token = getJwtToken();
  const user = useReactiveVar(userVar);
  const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

  /** APOLLO REQUESTS **/
  const [updateMember] = useMutation(UPDATE_MEMBER);

  /** LIFECYCLES **/
  useEffect(() => {
    setUpdateData({
      ...updateData,
      memberNick: user.memberNick,
      memberPhone: user.memberPhone,
      memberAddress: user.memberAddress,
      memberImage: user.memberImage,
    });
  }, [user]);

  /** HANDLERS **/
  const uploadImage = async (e: any) => {
    try {
      const image = e.target.files[0];
      console.log('+image:', image);

      const formData = new FormData();
      formData.append(
        'operations',
        JSON.stringify({
          query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
          variables: {
            file: null,
            target: 'member',
          },
        }),
      );
      formData.append(
        'map',
        JSON.stringify({
          '0': ['variables.file'],
        }),
      );
      formData.append('0', image);

      const graphqlUrl =
        process.env.NEXT_PUBLIC_REACT_APP_API_GRAPHQL_URL ||
        process.env.REACT_APP_API_GRAPHQL_URL ||
        'http://localhost:3000/graphql';

      const response = await axios.post(graphqlUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'apollo-require-preflight': true,
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for GraphQL errors
      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'Image upload failed');
      }

      if (!response.data.data?.imageUploader) {
        throw new Error('Invalid response from server');
      }

      const responseImage = response.data.data.imageUploader;
      console.log('+responseImage: ', responseImage);
      updateData.memberImage = responseImage;
      setUpdateData({ ...updateData });

      return `${REACT_APP_API_URL}/${responseImage}`;
    } catch (err: any) {
      console.log('Error, uploadImage:', err);
      await showError(err.message || 'Failed to upload image');
      throw err;
    }
  };

  const updatePropertyHandler = useCallback(async () => {
    try {
      if (!user?._id) throw new Error(Messages.error2);

      updateData._id = user?._id;

      const result = await updateMember({
        variables: {
          input: updateData,
        },
      });

      // @ts-ignore
      const jwtToken = result.data.updateMember?.accessToken;
      await updateStorage({ jwtToken });
      updateUserInfo(result.data.updateMember?.accessToken);

      await showSuccess('information updated successfully.');
    } catch (err: any) {
      await showError(err.message || 'An error occurred');
    }
  }, [updateData]);

  const doDisabledCheck = () => {
    if (
      updateData.memberNick === '' ||
      updateData.memberPhone === '' ||
      updateData.memberAddress === '' ||
      updateData.memberImage === ''
    ) {
      return true;
    }
  };

  console.log('+updateData', updateData);

  if (device === 'mobile') {
    return <>MY PROFILE PAGE MOBILE</>;
  } else
    return (
      <div id="my-profile-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">My Profile</Typography>
            <Typography className="sub-title">We are glad to see you again!</Typography>
          </Stack>
        </Stack>
        <Stack className="top-box">
          <Stack className="photo-box">
            <Typography className="title">Photo</Typography>
            <Stack className="image-big-box">
              <Stack className="image-box">
                <img
                  src={
                    updateData?.memberImage
                      ? `${REACT_APP_API_URL}/${updateData?.memberImage}`
                      : `/img/profile/defaultUser.svg`
                  }
                  alt=""
                />
              </Stack>
              <Stack className="upload-big-box">
                <input
                  type="file"
                  hidden
                  id="hidden-input"
                  onChange={uploadImage}
                  accept="image/jpg, image/jpeg, image/png, image/webp, image/avif"
                />
                <label htmlFor="hidden-input" className="labeler">
                  <Typography>Upload Profile Image</Typography>
                </label>
                <Typography className="upload-text">
                  A photo must be in JPG, JPEG, PNG, WebP or AVIF format!
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack className="small-input-box">
            <Stack className="input-box">
              <Typography className="title">Username</Typography>
              <input
                type="text"
                placeholder="Your username"
                value={updateData.memberNick}
                onChange={({ target: { value } }) =>
                  setUpdateData({ ...updateData, memberNick: value })
                }
              />
            </Stack>
            <Stack className="input-box">
              <Typography className="title">Phone</Typography>
              <input
                type="text"
                placeholder="Your Phone"
                value={updateData.memberPhone}
                onChange={({ target: { value } }) =>
                  setUpdateData({ ...updateData, memberPhone: value })
                }
              />
            </Stack>
          </Stack>
          <Stack className="address-box">
            <Typography className="title">Address</Typography>
            <input
              type="text"
              placeholder="Your address"
              value={updateData.memberAddress}
              onChange={({ target: { value } }) =>
                setUpdateData({ ...updateData, memberAddress: value })
              }
            />
          </Stack>
          <Stack className="about-me-box">
            <Button
              className="update-button"
              onClick={updatePropertyHandler}
              disabled={doDisabledCheck()}
            >
              <Typography>Update Profile</Typography>
            </Button>
          </Stack>
        </Stack>
      </div>
    );
};

MyProfile.defaultProps = {
  initialValues: {
    _id: '',
    memberImage: '',
    memberNick: '',
    memberPhone: '',
    memberAddress: '',
  },
};

export default MyProfile;
