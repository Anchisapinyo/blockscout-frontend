import { useRouter } from 'next/router';
import React from 'react';

import type { ItemType } from '../types';

import IconSvg from 'ui/shared/IconSvg';

import ButtonItem from '../parts/ButtonItem';
import MenuItem from '../parts/MenuItem';

interface Props {
  className?: string;
  hash: string;
  onBeforeClick: () => boolean;
  type: ItemType;
}

const PublicTagMenuItem = ({ className, hash, onBeforeClick, type }: Props) => {
  const router = useRouter();

  const handleClick = React.useCallback(() => {
    if (!onBeforeClick()) {
      return;
    }

    router.push({ pathname: '/account/public-tags-request', query: { address: hash } });
  }, [ hash, onBeforeClick, router ]);

  const element = (() => {
    switch (type) {
      case 'button': {
        return <ButtonItem label="Add public tag" icon="publictags" onClick={ handleClick } className={ className }/>;
      }
      case 'menu_item': {
        return (
          <MenuItem className={ className } onClick={ handleClick }>
            <IconSvg name="publictags" boxSize={ 6 } mr={ 2 }/>
            <span>Add public tag</span>
          </MenuItem>
        );
      }
    }
  })();

  return element;
};

export default React.memo(PublicTagMenuItem);
