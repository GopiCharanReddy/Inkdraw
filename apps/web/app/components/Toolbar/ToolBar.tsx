import React, { MouseEvent, useState } from 'react'
import { iconLibrary } from '../resources/icons'

export const ToolBarIcons = {
  icon: './arrowIcon',

}

const ToolBar = () => {
  const [active, setActive] = useState<string | null>(null);
  const [showMore, setShowMore] = useState<boolean | null>(null);
  const [selectedShape, setSelectedShape] = useState(iconLibrary.find(i => i.name === 'rectangleIcon') || iconLibrary[8]);
  const caretIcon = iconLibrary.find(i => i.name === 'caretUpIcon');
  return (
    <>
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2'>
        {/* Main ToolBar */}
        <div className='flex bg-white p-2 rounded-xl items-center shadow-2xl border border-neutral-200 gap-2'>
          {iconLibrary.slice(0, 8).map(icon => (
            <button
              key={icon.name}
              className={`rounded-lg p-2 transition-colors hover:bg-neutral-100 ${(active === icon.name) ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'hover:bg-neutral-100 text-neutral-700'}`} onClick={() => setActive(icon.name)}>
              <icon.icon size={20} />
            </button>
          ))}
          {/* Dynamic select shape button */}
          {selectedShape &&
            <button
              className={`rounded-lg p-2 transition-colors hover:bg-neutral-100 ${(active === selectedShape.name) ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'hover:bg-neutral-100 text-neutral-700'}`} onClick={() => setActive(selectedShape.name)}>
              <selectedShape.icon size={20} />
            </button>
          }
          {/* Toggle Button Caret */}
          <button
            className={`p-2 rounded-lg transition-colors ${showMore ? 'bg-neutral-100' : 'hover: bg-neutral-100}'}`}
            onClick={() => setShowMore(!showMore)}
          >{caretIcon && <caretIcon.icon size={20} />}</button>
        </div>
        {/* Shapes Menu */}
        {showMore &&
          <div className='absolute bottom-16 right-0 bg-white p-3 rounded-2xl shadow-2xl border border-neutral-200 w-48 animate-in fade-in slide-in-from-bottom-2'>
            <div className='grid grid-cols-4 gap-1'>
              {iconLibrary.slice(9).map(icon => (
                <button key={icon.name} className='p-2 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-700'>
                  <icon.icon
                    onClick={() => {
                      setActive(icon.name);
                      setShowMore(false);
                      setSelectedShape(icon);
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        }
      </div>
    </>
  )
}

export default ToolBar