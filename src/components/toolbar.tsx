import { GithubIcon } from 'lucide-react'
import { ThemeModeToggle } from './theme-mode-toggle'
import { Button } from './ui/button'

export function Toolbar() {
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <a
        href="https://github.com/tyuan511/background-cleaner"
        target="_blank"
        rel="noreferrer"
      >
        <Button variant="outline" size="icon">
          <GithubIcon className="size-4" />
        </Button>
      </a>
      <ThemeModeToggle />
    </div>
  )
}
