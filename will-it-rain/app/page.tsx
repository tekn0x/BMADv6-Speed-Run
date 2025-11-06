import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Tailwind CSS v4 + Shadcn UI Test
          </h1>
          <p className="text-muted">
            Testing Monochrome Storm theme, glassmorphic utilities, and component styling
          </p>
        </div>

        {/* Button Variants Test */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Testing default, outline, and ghost variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </CardContent>
        </Card>

        {/* Input Component Test */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>Testing input field with theme styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Enter your location..." />
            <Input type="email" placeholder="Email address" />
          </CardContent>
        </Card>

        {/* Custom Tailwind Utilities Test */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Custom Theme Colors</CardTitle>
            <CardDescription className="text-muted">Testing Monochrome Storm color palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-primary p-3 text-primary-foreground">
              Primary Color (#3b82f6)
            </div>
            <div className="rounded-md bg-surface p-3 text-foreground border border-border">
              Surface Color (#1a1a1a)
            </div>
            <div className="rounded-md bg-destructive p-3 text-destructive-foreground">
              Error Color (#ef4444)
            </div>
            <div className="rounded-md bg-success p-3 text-white">
              Success Color (#10b981)
            </div>
          </CardContent>
        </Card>

        {/* Glassmorphic Utilities Test */}
        <div className="glass-surface p-6 rounded-lg space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Glass Surface Test</h2>
          <p className="text-muted">
            This container uses the .glass-surface utility class with backdrop blur
          </p>
          <Button className="glow-primary">Button with Glow</Button>
        </div>

        {/* Border Radius Test */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Border Radius</CardTitle>
            <CardDescription>Testing lg (16px), md (12px), sm (6px) values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-surface p-4 rounded-lg border-2 border-primary">
              Large radius (16px)
            </div>
            <div className="bg-surface p-4 rounded-md border-2 border-primary">
              Medium radius (12px)
            </div>
            <div className="bg-surface p-4 rounded-sm border-2 border-primary">
              Small radius (6px)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
