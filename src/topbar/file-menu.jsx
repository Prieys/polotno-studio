import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  Classes,
  Position,
  Menu,
  MenuItem,
  MenuDivider,
  Popover,
} from '@blueprintjs/core';
import {
  Plus,
  Translate,
  InfoSign,
  FolderOpen,
  FloppyDisk,
  Import,
} from '@blueprintjs/icons';
// downloadFile is no longer used for saving JSON, but may be used elsewhere.
import { downloadFile } from 'polotno/utils/download';
import { svgToJson } from 'polotno/utils/from-svg';

export const FileMenu = observer(({ store, project }) => {
  const inputRef = React.useRef();

  const [faqOpened, toggleFaq] = React.useState(false);
  return (
    <>
      <Popover
        content={
          <Menu>
            <MenuItem
              icon={<Plus />}
              text="Create new design"
              onClick={() => {
                project.createNewDesign();
              }}
            />
            <MenuDivider />
            <MenuItem
              icon={<FolderOpen />}
              text="Load Editable Template"
              onClick={() => {
                document.querySelector('#load-project').click();
              }}
            />
            <MenuItem
              icon={<Import />}
              text="Import svg (experimental)"
              onClick={() => {
                document.querySelector('#svg-import-input').click();
              }}
            />
            <MenuItem
              icon={<FloppyDisk />}
              text="Export as Editable Template"
              onClick={() => {
                // Get the project state as a JSON object
                const json = store.toJSON();

                // Convert the JSON object into a nicely formatted string
                const jsonString = JSON.stringify(json, null, 2);

                // Create a Blob, which is a file-like object, from the string
                const blob = new Blob([jsonString], {
                  type: 'application/json',
                });

                // Create a temporary URL for this Blob
                const url = URL.createObjectURL(blob);

                // Create a temporary, invisible anchor element (<a>)
                const link = document.createElement('a');
                link.href = url;
                link.download = 'editable-template.json'; // The desired filename

                // Append the link to the body, click it to trigger the download, then remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Release the temporary URL from memory
                URL.revokeObjectURL(url);
              }}
            />

            <MenuDivider />
            <MenuItem text="Language" icon={<Translate />}>
              <MenuItem
                text="English"
                active={project.language.startsWith('en')}
                onClick={() => {
                  project.setLanguage('en');
                }}
              />
              <MenuItem
                text="Portuguese"
                active={project.language.startsWith('pt')}
                onClick={() => {
                  project.setLanguage('pt');
                }}
              />
              <MenuItem
                text="French"
                active={project.language.startsWith('fr')}
                onClick={() => {
                  project.setLanguage('fr');
                }}
              />
              <MenuItem
                text="Russian"
                active={project.language.startsWith('ru')}
                onClick={() => {
                  project.setLanguage('ru');
                }}
              />
              <MenuItem
                text="Indonesian"
                active={project.language.startsWith('id')}
                onClick={() => {
                  project.setLanguage('id');
                }}
              />
            </MenuItem>
            <MenuItem
              text="About"
              icon={<InfoSign />}
              onClick={() => {
                toggleFaq(true);
              }}
            />
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button minimal text="File" />
      </Popover>
      <input
        type="file"
        id="load-project"
        accept=".json,.polotno"
        ref={inputRef}
        style={{ width: '180px', display: 'none' }}
        onChange={(e) => {
          var input = e.target;

          if (!input.files.length) {
            return;
          }

          var reader = new FileReader();
          reader.onloadend = async function () {
            var text = reader.result;
            let json;
            try {
              json = JSON.parse(text);
            } catch (e) {
              alert('Can not load the project.');
            }

            const errors = store.validate(json);
            if (errors.length > 0) {
              alert('Can not load the project. See console for details.');
              console.error(errors);
              return;
            }

            if (json) {
              await project.createNewDesign();
              store.loadJSON(json);
              project.save();
              input.value = '';
            }
          };
          reader.onerror = function () {
            alert('Can not load the project.');
          };
          reader.readAsText(input.files[0]);
        }}
      />
      <input
        type="file"
        id="svg-import-input"
        accept=".svg"
        ref={inputRef}
        style={{ width: '180px', display: 'none' }}
        onChange={(e) => {
          var input = e.target;

          if (!input.files.length) {
            return;
          }

          var reader = new FileReader();
          reader.onloadend = async function () {
            var text = reader.result;
            let json;
            try {
              json = await svgToJson(text);
            } catch (e) {
              alert('Can not load the project.');
            }

            const errors = store.validate(json);
            if (errors.length > 0) {
              alert('Can not load the project. See console for details.');
              console.error(errors);
              return;
            }

            if (json) {
              await project.createNewDesign();
              store.loadJSON(json);
              project.save();
              input.value = '';
            }
          };
          reader.onerror = function () {
            alert('Can not load the project.');
          };
          reader.readAsText(input.files[0]);
        }}
      />
      <Dialog
        icon={<InfoSign />}
        onClose={() => toggleFaq(false)}
        title="About Polotno Studio"
        isOpen={faqOpened}
        style={{
          width: '80%',
          maxWidth: '700px',
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          <h2>What is Polotno Studio?</h2>
          <p>
            <strong>Polotno Studio</strong> - is a web application to create
            graphical designs. You can mix image, text and illustrations to make
            social media posts, youtube previews, podcast covers, business cards
            and presentations.
          </p>
          <h2>Is it Open Source?</h2>
          <p>
            Partially. The source code is available in{' '}
            <a href="https://github.com/lavrton/polotno-studio" target="_blank">
              GitHub repository
            </a>
            . The repository doesn't have full source.{' '}
            <strong>Polotno Studio</strong> is powered by{' '}
            <a href="https://polotno.com/" target="_blank">
              Polotno SDK project
            </a>
            . All core "canvas editor" functionality are implemented by{' '}
            <strong>polotno</strong> npm package (which is not open source at
            the time of writing this text).
          </p>
          <p>
            Polotno Studio is build on top of Polotno SDK to provide a
            desktop-app-like experience.
          </p>
          <h2>Who is making Polotno Studio?</h2>
          <p>
            My name is Anton Lavrenov{' '}
            <a href="https://twitter.com/lavrton" target="_blank">
              @lavrton
            </a>
            . I am founder of Polotno project. As the maintainer of{' '}
            <a href="https://konvajs.org/" target="_blank">
              Konva 2d canvas framework
            </a>
            , I created several similar apps for different companies around the
            world. So I decided to compile all my knowledge and experience into
            reusable Polotno project.
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => toggleFaq(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
});
