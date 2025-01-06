'use client';

import React from 'react';

export function EditableText(props: {
  text: string;
  setText: (text: string) => void;
  className?: string;
}) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!isEditing) {
    return (
      <div className={`cursor-text ${props.className}`} onClick={() => setIsEditing(true)}>
        {props.text}
      </div>
    );
  }

  return (
    <input type='text' spellCheck={false} autoFocus className={props.className} onBlur={e => {
      props.setText(e.target.value);
      setIsEditing(false);
    }} defaultValue={props.text} />
  )
}
