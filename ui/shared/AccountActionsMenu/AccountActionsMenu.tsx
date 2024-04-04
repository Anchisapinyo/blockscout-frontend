import { Box, IconButton, Menu, MenuButton, MenuList, Skeleton, chakra } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { ItemProps } from './types';

import config from 'configs/app';
import useFetchProfileInfo from 'lib/hooks/useFetchProfileInfo';
import useIsAccountActionAllowed from 'lib/hooks/useIsAccountActionAllowed';
import * as mixpanel from 'lib/mixpanel/index';
import getQueryParamString from 'lib/router/getQueryParamString';
import IconSvg from 'ui/shared/IconSvg';

import PrivateTagMenuItem from './items/PrivateTagMenuItem';
import PublicTagMenuItem from './items/PublicTagMenuItem';
import TokenInfoMenuItem from './items/TokenInfoMenuItem';

interface Props {
  isLoading?: boolean;
  className?: string;
}

const AccountActionsMenu = ({ isLoading, className }: Props) => {
  const router = useRouter();

  const hash = getQueryParamString(router.query.hash);
  const isTokenPage = router.pathname === '/token/[hash]';
  const isTxPage = router.pathname === '/tx/[hash]';
  const isAccountActionAllowed = useIsAccountActionAllowed();

  const userInfoQuery = useFetchProfileInfo();

  const handleButtonClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.PAGE_WIDGET, { Type: 'Address actions (more button)' });
  }, []);

  if (!config.features.account.isEnabled) {
    return null;
  }

  const userWithoutEmail = userInfoQuery.data && !userInfoQuery.data.email;

  const items = [
    {
      render: (props: ItemProps) => <TokenInfoMenuItem { ...props }/>,
      enabled: isTokenPage && config.features.addressVerification.isEnabled && !userWithoutEmail,
    },
    {
      render: (props: ItemProps) => <PrivateTagMenuItem { ...props } entityType={ isTxPage ? 'tx' : 'address' }/>,
      enabled: true,
    },
    {
      render: (props: ItemProps) => <PublicTagMenuItem { ...props }/>,
      enabled: !isTxPage,
    },
  ].filter(({ enabled }) => enabled);

  if (items.length === 0) {
    return null;
  }

  if (isLoading) {
    return <Skeleton w="36px" h="32px" borderRadius="base" className={ className }/>;
  }

  if (items.length === 1) {
    return (
      <Box className={ className }>
        { items[0].render({ type: 'button', hash, onBeforeClick: isAccountActionAllowed }) }
      </Box>
    );
  }

  return (
    <Menu>
      <MenuButton
        as={ IconButton }
        className={ className }
        size="sm"
        variant="outline"
        colorScheme="gray"
        px="7px"
        onClick={ handleButtonClick }
        icon={ <IconSvg name="dots" boxSize="18px"/> }
      />
      <MenuList minWidth="180px" zIndex="popover">
        { items.map(({ render }, index) => (
          <React.Fragment key={ index }>
            { render({ type: 'menu_item', hash, onBeforeClick: isAccountActionAllowed }) }
          </React.Fragment>
        )) }
      </MenuList>
    </Menu>
  );
};

export default React.memo(chakra(AccountActionsMenu));
