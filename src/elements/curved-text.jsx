import React from 'react';
import { observer } from 'mobx-react-lite';
import { TextPath } from 'react-konva';

// This is the React component that will render our curved text on the canvas
export const CurvedText = observer(({ element }) => {
  const textRef = React.useRef(null);

  // This is an SVG path that defines the curve.
  // We're using a simple arc as a default.
  // This can be made editable later.
  const curvePath = 'M0,100 C50,0 150,0 200,100';

  return (
    <TextPath
      ref={textRef}
      data={curvePath}
      text={element.text}
      fill={element.fill}
      fontFamily={element.fontFamily}
      fontSize={element.fontSize}
      fontStyle={element.fontStyle}
      textDecoration={element.textDecoration}
      align={element.align}
      letterSpacing={element.letterSpacing}
      // Set some default draggable and transform properties
      draggable
      // Polotno uses names for selection handles
      name="element"
      id={element.id}
    />
  );
});
