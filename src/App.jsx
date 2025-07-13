import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, TextSection, LayersSection } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
// import { PagesTimeline } from 'polotno/pages-timeline'; // REMOVED
import { setTranslations } from 'polotno/config';
import { loadFile } from './file';
import { QrSection } from './sections/qr-section';
import { QuotesSection } from './sections/quotes-section';
import { CustomAssetsSection } from './sections/CustomAssetsSection';
import { useProject } from './project';
import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';
import zhCh from './translations/zh-ch';
import Topbar from './topbar/topbar';

import { PasswordProtect } from './auth/PasswordProtect';

setTranslations(en);

const sections = [
  CustomAssetsSection,
  TextSection,
  QuotesSection,
  QrSection,
  LayersSection,
];

const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;
  if (isStandalone()) {
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue('env(safe-area-inset-bottom)');
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream) {
        safeAreaInsetBottom = 20;
      }
    }
  }
  return window.innerHeight - safeAreaInsetBottom;
};

const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const authStatus = sessionStorage.getItem('is-authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const project = useProject();
  const height = useHeight();

  React.useEffect(() => {
    if (store) {
      const umd = 300;
      const width = 8.5 * umd;
      const height = 11 * umd;
      store.setSize(width, height);
    }
  }, [store]);
  
  React.useEffect(() => {
    if (!store || !store.width) {
      return;
    }

    const branding = {
      id: 'branding_watermark',
      type: 'text',
      x: 0,
      y: store.height - 60,
      width: store.width,
      height: 50,
      align: 'center',
      verticalAlign: 'middle',
      text: 'Created with Priey Design Studio | www.priey.com',
      fontSize: 32,
      fill: '#999999',
      selectable: false,
      editable: false,
      removable: false,
    };

    const ensureBranding = (page) => {
      if (!page) return;
      const existing = page.children.find((el) => el.id === branding.id);
      if (!existing) {
        page.addElement(branding);
      }
    };

    ensureBranding(store.activePage);

    const unsubscribe = store.on('change', () => {
      ensureBranding(store.activePage);
    });

    return () => {
      unsubscribe();
    };
  }, [store, store?.width]);

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith('id')) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith('zh')) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  React.useEffect(() => {
    project.firstLoad();
  }, []);

  const handleDrop = (ev) => {
    ev.preventDefault();
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  if (!isAuthenticated) {
    return <PasswordProtect />;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: height + 'px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={sections} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            {/* THIS IS THE CORRECTED SECTION */}
            <Workspace
              store={store}
              showCredit={false}
              textDefault={{
                editable: true,
                fontSize: 20,
                fill: 'black',
              }}
            />
            {/* END OF CORRECTION */}
            <ZoomButtons store={store} />
            {/* <PagesTimeline store={store} /> */} {/* REMOVED */}
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      {project.status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
            }}
          >
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
