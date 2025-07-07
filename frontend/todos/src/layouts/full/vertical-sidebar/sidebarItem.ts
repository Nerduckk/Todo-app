import { SmartHomeIcon, ArchiveIcon, XIcon } from 'vue-tabler-icons'

export interface menu {
  header?: string
  title?: string
  icon?: any
  to?: string
  chip?: string
  chipColor?: string
  chipBgColor?: string
  chipVariant?: string
  chipIcon?: string
  children?: menu[]
  disabled?: boolean
  type?: string
  subCaption?: string
  external?: boolean
}

const sidebarItem: menu[] = [
  {
    title: 'Home',
    icon: SmartHomeIcon,
    to: '/',
    external: false,
  },
  {
    title: 'Archived',
    icon: ArchiveIcon,
    chipColor: 'primary',
    chipBgColor: 'lightprimary',
    external: false,
    to: '/todo/archive',
  },
  {
    title: 'Deleted',
    icon: XIcon,
    chipColor: 'primary',
    chipBgColor: 'lightprimary',
    to: '/todo/delete',
    external: false,
  },
]

export default sidebarItem
