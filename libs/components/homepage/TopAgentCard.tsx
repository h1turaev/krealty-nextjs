import { useQuery } from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { GET_COMMENTS, GET_PROPERTIES } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Comment } from '../../types/comment/comment';
import { T } from '../../types/common';
import { Member } from '../../types/member/member';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';

interface TopAgentProps {
  agent: Member;
}

const TopAgentCard = (props: TopAgentProps) => {
  const { agent } = props;
  const device = useDeviceDetect();
  const [mostLikedProperty, setMostLikedProperty] = useState<Property | null>(null);
  const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const agentImage = agent?.memberImage
    ? `${REACT_APP_API_URL}/${agent?.memberImage}`
    : '/img/profile/defaultUser.svg';

  // Fetch agent properties
  const propertiesInquiry: PropertiesInquiry = {
    page: 1,
    limit: 100,
    sort: 'propertyLikes',
    direction: Direction.DESC,
    search: {
      memberId: agent?._id,
    },
  };

  useQuery(GET_PROPERTIES, {
    fetchPolicy: 'cache-and-network',
    variables: { input: propertiesInquiry },
    skip: !agent?._id,
    onCompleted: (data: T) => {
      if (data?.getProperties?.list && data?.getProperties?.list.length > 0) {
        // Get the most liked property
        const properties = data?.getProperties?.list;
        const mostLiked = properties.reduce((prev: Property, current: Property) =>
          current.propertyLikes > prev.propertyLikes ? current : prev,
        );
        setMostLikedProperty(mostLiked);
      }
    },
  });

  // Fetch comments for the most liked property
  useQuery(GET_COMMENTS, {
    fetchPolicy: 'cache-and-network',
    variables: {
      input: {
        page: 1,
        limit: 5,
        sort: 'createdAt',
        direction: Direction.DESC,
        search: {
          commentRefId: mostLikedProperty?._id || '',
        },
      },
    },
    skip: !mostLikedProperty?._id,
    onCompleted: (data: T) => {
      if (data?.getComments?.list) {
        setPropertyComments(data?.getComments?.list);
      }
    },
  });

  const propertyImage = mostLikedProperty?.propertyImages?.[0]
    ? `${REACT_APP_API_URL}/${mostLikedProperty.propertyImages[0]}`
    : '/img/property/defaultProperty.jpg';

  if (device === 'mobile') {
    return (
      <Link
        href={{
          pathname: '/agent/detail',
          query: { agentId: agent?._id },
        }}
        style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}
      >
        <Stack className="top-agent-card">
          <img src={agentImage} alt="" />
          <strong>{agent?.memberNick}</strong>
          <span>{agent?.memberType}</span>
        </Stack>
      </Link>
    );
  } else {
    return (
      <Stack className="top-agent-card">
        {/* Left side - Agent Image with Overlay */}
        <Link
          href={{
            pathname: '/agent/detail',
            query: { agentId: agent?._id },
          }}
          style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}
        >
          <Box className="agent-image-container">
            <img src={agentImage} alt={agent?.memberNick} className="agent-image" />
            <Box className="agent-overlay">
              <Typography className="agent-name">{agent?.memberNick}</Typography>
              <Typography className="agent-type">
                Real Estate {agent?.memberType?.toUpperCase()}, HIGHLAND
              </Typography>
            </Box>
          </Box>
        </Link>

        {/* Right side - Property/Comments Card */}
        <Box
          className="property-card"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {mostLikedProperty && (
            <Box className={`property-image-container ${isHovering ? 'visible' : 'hidden'}`}>
              <img
                src={propertyImage}
                alt={mostLikedProperty?.propertyTitle}
                className="property-image"
              />
              <Box className="property-logo">
                <span>@</span>
                <span>COMMUNITY</span>
              </Box>
            </Box>
          )}
          <Box className={`comments-container ${isHovering ? 'hidden' : 'visible'}`}>
            {propertyComments.length > 0 ? (
              <>
                <Typography className="property-quote">
                  "{propertyComments[0]?.commentContent}"
                </Typography>
                <Box className="property-logo">
                  <span>@</span>
                  <span>COMMUNITY</span>
                </Box>
              </>
            ) : mostLikedProperty ? (
              <>
                <Typography className="property-quote">
                  "{mostLikedProperty?.propertyTitle}"
                </Typography>
                <Box className="property-logo">
                  <span>@</span>
                  <span>Logoipsum</span>
                </Box>
              </>
            ) : (
              <Typography className="property-quote">No properties available</Typography>
            )}
          </Box>
        </Box>
      </Stack>
    );
  }
};

export default TopAgentCard;
