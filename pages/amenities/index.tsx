import { Stack } from '@mui/material';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Amenities from '../../libs/components/homepage/Amenities';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

const AmenitiesPage: NextPage = () => {
  return (
    <div id="amenities-page">
      <Amenities />
    </div>
  );
};

export default withLayoutBasic(AmenitiesPage);
