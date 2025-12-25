import { IconType } from 'react-icons';
import { CiLocationArrow1 } from 'react-icons/ci';
import { RxHand, RxThickArrowDown, RxThickArrowLeft, RxThickArrowRight, RxThickArrowUp } from "react-icons/rx";
import { RxPencil1 } from "react-icons/rx";
import { BsEraser } from "react-icons/bs";
import { GoArrowUpRight, GoStar } from "react-icons/go";
import { CiStickyNote } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { PiCaretUpLight, PiCircle, PiDiamond, PiHighlighterLight, PiParallelogram } from "react-icons/pi";
import { PiRectangle } from "react-icons/pi";
import { RxText } from "react-icons/rx";
import { BsTriangle } from "react-icons/bs";
import { BsHexagon } from "react-icons/bs";
import { IoHeartOutline } from "react-icons/io5";
import { LuSlash } from "react-icons/lu";
import { GiLaserburn } from "react-icons/gi";
import { Shape } from '@repo/schema';


export type ToolName = Shape["type"] | "select" | "hand" | "eraser" | "laser" | "caretup" | "arrow" | "arrowLeft" | "arrowRight" |  "arrowUp" | "arrowDown" | "highlight" ;

type iconProps = {
  name: string,
  icon: IconType,
  shapeType: ToolName
}

export const iconLibrary: iconProps[] = [
  {
    name: 'selectIcon',
    icon: CiLocationArrow1,
    shapeType: 'select'
  },
  {
    name: 'handIcon',
    icon: RxHand,
    shapeType: 'hand'
  },
  {
    name: 'pencil',
    icon: RxPencil1,
    shapeType: 'pencil'
  },
  {
    name: 'eraserIcon',
    icon: BsEraser,
    shapeType: 'eraser'
  },
  {
    name: 'arrowIcon',
    icon: GoArrowUpRight,
    shapeType: 'arrow'
  },
  {
    name: 'textIcon',
    icon: RxText,
    shapeType: 'text'
  },
  {
    name: 'noteIcon',
    icon: CiStickyNote,
    shapeType: 'note'
  },
  {
    name: 'imageIcon',
    icon: CiImageOn,
    shapeType: 'image'
  },
  {
    name: 'reactangleIcon',
    icon: PiRectangle,
    shapeType: 'rectangle'
  },
  {
    name: 'diamondIcon',
    icon: PiDiamond,
    shapeType: 'diamond'
  },
  {
    name: 'circleIcon',
    icon: PiCircle,
    shapeType: 'circle'
  },
  {
    name: 'triangleIcon',
    icon: BsTriangle,
    shapeType: 'triangle'
  },
  {
    name: 'HexagonIcon',
    icon: BsHexagon,
    shapeType: 'hexagon'
  },
  {
    name: 'RhombusIcon',
    icon: PiParallelogram,
    shapeType: 'rhombus'
  },
  {
    name: 'StarIcon',
    icon: GoStar,
    shapeType: 'star'
  },
  {
    name: 'HeartIcon',
    icon: IoHeartOutline,
    shapeType: 'heart'
  },
  {
    name: 'ArrowLeftIcon',
    icon: RxThickArrowLeft,
    shapeType: 'arrowLeft'
  },
  {
    name: 'ArrowUpIcon',
    icon: RxThickArrowUp,
    shapeType: 'arrowUp'
  },
  {
    name: 'ArrowDownIcon',
    icon: RxThickArrowDown,
    shapeType: 'arrowDown'
  },
  {
    name: 'ArrowRightIcon',
    icon: RxThickArrowRight,
    shapeType: 'arrowRight'
  },
  {
    name: 'LineIcon',
    icon: LuSlash,
    shapeType: 'line'
  },
  {
    name: 'HighlightIcon',
    icon: PiHighlighterLight,
    shapeType: 'highlight'
  },
  {
    name: 'LaserIcon',
    icon: GiLaserburn,
    shapeType: 'laser'
  },
  {
  name: 'caretUpIcon',
  icon: PiCaretUpLight,
  shapeType: 'caretup'
  },
]