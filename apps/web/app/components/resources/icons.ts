import { IconType } from 'react-icons';
import { CiLocationArrow1 } from 'react-icons/ci';
import { RxHand, RxThickArrowDown, RxThickArrowLeft, RxThickArrowRight, RxThickArrowUp } from "react-icons/rx";
import { RxPencil1 } from "react-icons/rx";
import { BsEraser, BsHighlighter } from "react-icons/bs";
import { GoArrowUpRight, GoStar } from "react-icons/go";
import { RiText } from "react-icons/ri";
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


type iconProps = {
  name: string,
  icon: IconType
}

export const iconLibrary: iconProps[] = [
  {
    name: 'selectIcon',
    icon: CiLocationArrow1
  },
  {
    name: 'handIcon',
    icon: RxHand
  },
  {
    name: 'drawIcon',
    icon: RxPencil1
  },
  {
    name: 'eraserIcon',
    icon: BsEraser
  },
  {
    name: 'arrowIcon',
    icon: GoArrowUpRight
  },
  {
    name: 'textIcon',
    icon: RxText
  },
  {
    name: 'noteIcon',
    icon: CiStickyNote
  },
  {
    name: 'imageIcon',
    icon: CiImageOn
  },
  {
    name: 'caretUpIcon',
    icon: PiCaretUpLight
  },
  {
    name: 'reactangleIcon',
    icon: PiRectangle
  },
  {
    name: 'diamondIcon',
    icon: PiDiamond
  },
  {
    name: 'circleIcon',
    icon: PiCircle
  },
  {
    name: 'triangleIcon',
    icon: BsTriangle
  },
  {
    name: 'HexagonIcon',
    icon: BsHexagon
  },
  {
    name: 'RhombusIcon',
    icon: PiParallelogram
  },
  {
    name: 'StarIcon',
    icon: GoStar
  },
  {
    name: 'HeartIcon',
    icon: IoHeartOutline
  },
  {
    name: 'ArrowLeftIcon',
    icon: RxThickArrowLeft
  },
  {
    name: 'ArrowUpIcon',
    icon: RxThickArrowUp
  },
  {
    name: 'ArrowDownIcon',
    icon: RxThickArrowDown
  },
  {
    name: 'ArrowRightIcon',
    icon: RxThickArrowRight
  },
  {
    name: 'LineIcon',
    icon: LuSlash
  },
  {
    name: 'HighlightIcon',
    icon: PiHighlighterLight
  },
  {
    name: 'LaserIcon',
    icon: GiLaserburn
  },
]