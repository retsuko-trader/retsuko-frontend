'use client';

import React from 'react';

export function EditableText(props: {
  text: string;
  setText: (text: string) => void;
  placeHolder?: React.ReactNode;
  className?: string;
}) {
  const [isEditing, setIsEditing] = React.useState(false);

  const doneEditing = (e: { currentTarget: { value: string } }) => {
    props.setText(e.currentTarget.value);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className={`cursor-text ${props.className}`} onClick={e => {
        setIsEditing(true);
        e.preventDefault();
      }}>
        {props.text === '' ? props.placeHolder : props.text}
      </div>
    );
  }

  return (
    <input type='text' spellCheck={false} autoFocus className={props.className} onBlur={doneEditing} onKeyDown={e => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        doneEditing(e);
      }
    }} defaultValue={props.text} />
  )
}
