# UI Kit Documentation

A comprehensive atomic design system for building consistent, beautiful interfaces with Framer Motion animations.

## 📦 Components

- [Button](#button) - Primary interaction component
- [Input](#input) - Text input fields
- [TextArea](#textarea) - Multi-line text input
- [Typography](#typography) - Headings and text
- [Card](#card) - Content containers
- [Badge](#badge) - Status indicators
- [Avatar](#avatar) - User representations

---

## Button

Versatile button component with multiple variants and sizes.

### Import

```tsx
import { Button, IconButton } from '@/components/ui';
```

### Variants

- `primary` - Blue gradient, main actions
- `secondary` - Dark gray, secondary actions
- `success` - Green gradient, positive actions
- `danger` - Red, destructive actions
- `ghost` - Transparent, subtle actions
- `outline` - Bordered, minimal emphasis

### Sizes

- `sm` - Small (text-sm, compact padding)
- `md` - Medium (default, balanced)
- `lg` - Large (prominent, spacious)

### Props

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}
```

### Examples

```tsx
// Primary button
<Button variant="primary" size="lg">
  Save Changes
</Button>

// Button with icon
<Button 
  variant="success"
  leftIcon={<PlusIcon />}
>
  Create Meeting
</Button>

// Loading state
<Button isLoading>
  Processing...
</Button>

// Full width
<Button fullWidth variant="primary">
  Submit
</Button>

// Icon button
<IconButton
  icon={<MenuIcon />}
  variant="ghost"
  aria-label="Open menu"
/>
```

### Animations

- **Hover**: Scales to 1.02, lifts slightly (y: -1px)
- **Tap**: Scales to 0.98
- **Loading**: Rotating spinner animation

---

## Input

Form input with label, error states, and icons.

### Import

```tsx
import { Input } from '@/components/ui';
```

### Sizes

- `sm` - Small, compact
- `md` - Medium (default)
- `lg` - Large, prominent

### Props

```tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  // ... standard input props
}
```

### Examples

```tsx
// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  type="email"
  required
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>

// With icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search meetings..."
/>

// Large size
<Input
  inputSize="lg"
  label="Meeting Title"
  placeholder="Напр., Стратегия развития Q3"
/>
```

### States

- **Normal**: White background, slate border
- **Focus**: Blue border, ring effect
- **Error**: Red border, red background tint
- **Disabled**: Gray background, no interaction

---

## TextArea

Multi-line text input component.

### Import

```tsx
import { TextArea } from '@/components/ui';
```

### Props

```tsx
interface TextAreaProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
  // ... standard textarea props
}
```

### Example

```tsx
<TextArea
  label="Description"
  placeholder="Enter details..."
  rows={6}
  required
/>
```

---

## Typography

Text and heading components with consistent styling.

### Import

```tsx
import { Heading, Text, Label } from '@/components/ui';
```

### Heading

```tsx
// Levels: h1, h2, h3, h4, h5, h6
<Heading level="h1" weight="black">
  Main Title
</Heading>

<Heading level="h3">
  Subsection
</Heading>
```

### Text

```tsx
// Variants
<Text variant="body">Regular paragraph text</Text>
<Text variant="small">Smaller text</Text>
<Text variant="caption">Very small caption</Text>
<Text variant="overline">UPPERCASE OVERLINE</Text>

// Colors
<Text color="primary">Primary text</Text>
<Text color="secondary">Secondary text</Text>
<Text color="muted">Muted text</Text>
<Text color="success">Success message</Text>
<Text color="danger">Error message</Text>

// Weight
<Text weight="bold">Bold text</Text>
<Text weight="semibold">Semibold text</Text>
```

### Label

```tsx
<Label required>
  Email Address
</Label>
```

---

## Card

Content container with variants for different use cases.

### Import

```tsx
import { Card, CardHeader, CardFooter } from '@/components/ui';
```

### Variants

- `default` - Basic card with border
- `outlined` - Prominent border, no shadow
- `elevated` - Large shadow, no border
- `interactive` - Hover effects for clickable cards

### Padding

- `none` - No padding
- `sm` - Small (p-4)
- `md` - Medium (p-6 md:p-8, default)
- `lg` - Large (p-8 md:p-12)

### Examples

```tsx
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

// Interactive card (for links)
<Link to="/meeting/123">
  <Card variant="interactive">
    <CardHeader
      icon={<MeetingIcon />}
      title="Meeting Title"
      subtitle="Meeting description"
      action={<Badge variant="success">Active</Badge>}
    />
    <CardFooter>
      <AvatarGroup avatars={participants} />
      <Text variant="caption">2 days ago</Text>
    </CardFooter>
  </Card>
</Link>

// Elevated card
<Card variant="elevated" padding="lg">
  <h2>Important Content</h2>
</Card>
```

### Animations

Interactive cards have:
- **Hover**: Scale 1.02, lift (y: -4px)
- **Tap**: Scale 0.98

---

## Badge

Small status indicators and labels.

### Import

```tsx
import { Badge, StatusBadge } from '@/components/ui';
```

### Variants

- `primary` - Blue
- `secondary` - Gray
- `success` - Green
- `danger` - Red
- `warning` - Orange
- `info` - Cyan

### Sizes

- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

### Examples

```tsx
// Basic badge
<Badge variant="success">Active</Badge>

// With dot indicator
<Badge variant="danger" dot>
  Urgent
</Badge>

// Status badge
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="completed" />
```

### Animations

- Fades in with scale animation on mount

---

## Avatar

User representation component.

### Import

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';
```

### Sizes

- `xs` - Extra small (w-6 h-6)
- `sm` - Small (w-8 h-8)
- `md` - Medium (w-10 h-10, default)
- `lg` - Large (w-12 h-12)
- `xl` - Extra large (w-16 h-16)

### Examples

```tsx
// With initials
<Avatar name="John Doe" size="md" />

// With image
<Avatar name="John Doe" src="/avatar.jpg" />

// Avatar group
<AvatarGroup
  avatars={[
    { name: 'Alice Johnson', src: '/alice.jpg' },
    { name: 'Bob Smith' },
    { name: 'Carol Davis' },
    { name: 'David Wilson' }
  ]}
  max={3}
  size="sm"
/>
// Shows 3 avatars + "+1" overflow
```

### Animations

- Pops in with spring animation

---

## 🎨 Design System

### Colors

```tsx
// Primary
text-blue-600, bg-blue-50, border-blue-400

// Success
text-green-600, bg-green-50, from-green-400 to-green-700

// Danger
text-red-600, bg-red-50, border-red-400

// Muted
text-slate-500, bg-slate-50, border-slate-200

// Dark
text-slate-900, bg-slate-900
```

### Spacing Scale

```tsx
sm: 'px-3 py-1.5'
md: 'px-6 py-3'
lg: 'px-8 py-4'
```

### Border Radius

```tsx
rounded-lg: 8px    // Small elements
rounded-xl: 12px   // Medium elements
rounded-2xl: 16px  // Large elements
rounded-3xl: 24px  // Cards
```

### Shadows

```tsx
shadow-sm       // Subtle
shadow-lg       // Medium
shadow-xl       // Large
shadow-2xl      // Extra large

// Colored shadows
shadow-blue-200
shadow-green-200
shadow-slate-200
```

---

## 🎭 Animation Patterns

All components use consistent Framer Motion animations:

### Button/Interactive Elements
```tsx
whileHover={{ scale: 1.02, y: -1 }}
whileTap={{ scale: 0.98 }}
```

### Fade In
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
```

### Slide Up
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

### Pop In (Spring)
```tsx
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 300 }}
```

---

## 📋 Usage Examples

### Login Form

```tsx
<form onSubmit={handleLogin}>
  <Input
    type="email"
    label="Email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    fullWidth
  />
  
  <Input
    type="password"
    label="Password"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    fullWidth
  />
  
  <Button
    type="submit"
    variant="primary"
    size="lg"
    fullWidth
    isLoading={isSubmitting}
  >
    Sign In
  </Button>
</form>
```

### Meeting Card

```tsx
<Link to={`/meeting/${meeting.id}`}>
  <Card variant="interactive">
    <CardHeader
      icon={<CalendarIcon />}
      title={meeting.title}
      subtitle={meeting.question}
      action={
        <Badge variant="success">
          Active
        </Badge>
      }
    />
    <CardFooter>
      <AvatarGroup avatars={participants} max={3} />
      <Text variant="caption" color="muted">
        {formatDate(meeting.createdAt)}
      </Text>
    </CardFooter>
  </Card>
</Link>
```

### Dashboard Header

```tsx
<div className="flex justify-between items-center mb-10">
  <div>
    <Heading level="h1">Your Meetings</Heading>
    <Text variant="body" color="muted">
      Manage your meeting effectiveness
    </Text>
  </div>
  
  <Button
    variant="success"
    leftIcon={<PlusIcon />}
    onClick={createMeeting}
  >
    Create Meeting
  </Button>
</div>
```

---

## 🚀 Best Practices

1. **Consistency**: Always use UI components instead of raw HTML/CSS
2. **Variants**: Choose appropriate variants for context
3. **Accessibility**: Always provide `aria-label` for icon buttons
4. **Full Width**: Use `fullWidth` for mobile-responsive forms
5. **Loading States**: Show loading feedback for async operations
6. **Error Handling**: Display errors using `error` prop on inputs
7. **Composition**: Combine components (Card + CardHeader + CardFooter)

---

## 🎯 Migration Guide

### Before (Raw HTML/CSS)

```tsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
  Click Me
</button>
```

### After (UI Component)

```tsx
<Button variant="primary">
  Click Me
</Button>
```

### Benefits

- ✅ Consistent styling across app
- ✅ Built-in animations
- ✅ Accessible by default
- ✅ Responsive sizing
- ✅ Loading states
- ✅ Easy to maintain
- ✅ TypeScript support

---

## 📁 File Structure

```
components/ui/
├── Button.tsx      # Button & IconButton
├── Input.tsx       # Input & TextArea
├── Typography.tsx  # Heading, Text, Label
├── Card.tsx        # Card, CardHeader, CardFooter
├── Badge.tsx       # Badge & StatusBadge
├── Avatar.tsx      # Avatar & AvatarGroup
├── index.ts        # Barrel exports
└── README.md       # This file
```

---

## 🎨 Customization

All components accept `className` for custom styling:

```tsx
<Button 
  variant="primary"
  className="my-custom-class shadow-2xl"
>
  Custom Button
</Button>
```

Components use Tailwind's utility classes, so you can extend with any Tailwind class!

---

## ✨ Future Components

Coming soon:
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Radio` - Radio button
- `Switch` - Toggle switch
- `Modal` - Dialog/modal
- `Toast` - Notification
- `Tooltip` - Hover tooltip
- `Tabs` - Tab navigation
- `Dropdown` - Dropdown menu
- `Progress` - Progress bar

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

---

Made with ❤️ for MeetingQuality
