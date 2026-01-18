# UI Kit Quick Reference

Quick copy-paste examples for common use cases.

## 🔘 Buttons

```tsx
// Primary action
<Button variant="primary">Save</Button>

// Success action (green gradient)
<Button variant="success">Create</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="danger">Delete</Button>

// Subtle action
<Button variant="ghost">Back</Button>

// With icon
<Button variant="primary" leftIcon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Full width (mobile forms)
<Button fullWidth variant="primary">Submit</Button>

// Icon-only button
<IconButton
  icon={<MenuIcon />}
  variant="ghost"
  aria-label="Open menu"
/>
```

---

## 📝 Forms

```tsx
// Text input
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  fullWidth
/>

// Input with error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Input with helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>

// Input with icon
<Input
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>

// Large input
<Input
  inputSize="lg"
  label="Meeting Title"
  placeholder="Enter title..."
/>

// Textarea
<TextArea
  label="Description"
  placeholder="Enter details..."
  rows={6}
  required
/>
```

---

## 📄 Typography

```tsx
// Page title
<Heading level="h1">Dashboard</Heading>

// Section title
<Heading level="h2">Your Meetings</Heading>

// Subsection
<Heading level="h3">Details</Heading>

// Body text
<Text variant="body">Regular paragraph text</Text>

// Small text
<Text variant="small">Smaller supporting text</Text>

// Caption
<Text variant="caption">Very small text</Text>

// Overline
<Text variant="overline">Section Label</Text>

// Colored text
<Text color="muted">Muted description</Text>
<Text color="success">Success message</Text>
<Text color="danger">Error message</Text>

// Bold text
<Text weight="bold">Important text</Text>

// Label
<Label required>Email Address</Label>
```

---

## 🃏 Cards

```tsx
// Basic card
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Interactive card (for links)
<Link to="/item/123">
  <Card variant="interactive">
    <h3>Clickable Card</h3>
  </Card>
</Link>

// Card with header and footer
<Card variant="elevated">
  <CardHeader
    icon={<MeetingIcon />}
    title="Meeting Title"
    subtitle="Meeting description goes here"
    action={<Badge variant="success">Active</Badge>}
  />
  
  <p>Card body content</p>
  
  <CardFooter>
    <AvatarGroup avatars={participants} />
    <Text variant="caption">2 days ago</Text>
  </CardFooter>
</Card>

// No padding (for custom layouts)
<Card padding="none">
  <img src="/banner.jpg" />
  <div className="p-6">
    <h3>Custom Layout</h3>
  </div>
</Card>

// Large padding
<Card padding="lg">
  <h2>Spacious Content</h2>
</Card>
```

---

## 🏷️ Badges

```tsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="secondary">Inactive</Badge>

// With dot indicator
<Badge variant="success" dot>Online</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Status badge (pre-configured)
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="completed" />
```

---

## 👤 Avatars

```tsx
// Single avatar
<Avatar name="John Doe" size="md" />

// Avatar with image
<Avatar name="John Doe" src="/avatar.jpg" />

// Different sizes
<Avatar name="John Doe" size="xs" />
<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />

// Avatar group
<AvatarGroup
  avatars={[
    { name: 'Alice Johnson', src: '/alice.jpg' },
    { name: 'Bob Smith' },
    { name: 'Carol Davis' },
    { name: 'David Wilson' },
    { name: 'Eve Martinez' }
  ]}
  max={3}
  size="sm"
/>
// Shows: [A] [B] [C] +2
```

---

## 📋 Common Patterns

### Login Form
```tsx
<form onSubmit={handleLogin}>
  <Input
    type="email"
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    fullWidth
  />
  
  <Input
    type="password"
    label="Password"
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

### Page Header
```tsx
<div className="flex justify-between items-center mb-8">
  <div>
    <Heading level="h1">Page Title</Heading>
    <Text variant="body" color="muted">
      Description of the page
    </Text>
  </div>
  
  <Button
    variant="success"
    leftIcon={<PlusIcon />}
    onClick={handleCreate}
  >
    Create New
  </Button>
</div>
```

### Meeting Card
```tsx
<Link to={`/meeting/${meeting.id}`}>
  <Card variant="interactive">
    <CardHeader
      icon={<CalendarIcon className="w-6 h-6 text-blue-600" />}
      title={meeting.title}
      subtitle={meeting.description}
      action={
        <Badge variant="success">
          Active
        </Badge>
      }
    />
    
    <CardFooter className="flex items-center justify-between">
      <AvatarGroup
        avatars={meeting.participants}
        max={3}
        size="sm"
      />
      <Text variant="caption" color="muted">
        {formatDate(meeting.createdAt)}
      </Text>
    </CardFooter>
  </Card>
</Link>
```

### Filter Buttons
```tsx
<div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setFilter('all')}
    className={filter === 'all' ? 'bg-white shadow-sm' : ''}
  >
    All
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setFilter('active')}
    className={filter === 'active' ? 'bg-white shadow-sm' : ''}
  >
    Active
  </Button>
</div>
```

### Form with Validation
```tsx
<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
    required
    fullWidth
  />
  
  <Input
    label="Password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    error={errors.password}
    helperText="Must be at least 8 characters"
    required
    fullWidth
  />
  
  <Button
    type="submit"
    variant="primary"
    fullWidth
    isLoading={isSubmitting}
  >
    Submit
  </Button>
</form>
```

### Empty State
```tsx
<Card padding="lg" className="text-center">
  <div className="py-12">
    <Text variant="body" color="muted">
      No items found
    </Text>
  </div>
</Card>
```

---

## 🎨 Color Variants at a Glance

```
Button/Badge Variants:
primary   → Blue (main actions)
secondary → Gray (less emphasis)
success   → Green (positive actions) ✅
danger    → Red (destructive)
warning   → Orange (caution)
info      → Cyan (information)
ghost     → Transparent (subtle)
outline   → Bordered (minimal)
```

---

## 📏 Size Guide

```
Components with sizes:

Button:     sm | md | lg
Input:      sm | md | lg
Avatar:     xs | sm | md | lg | xl
Badge:      sm | md | lg
Card:       none | sm | md | lg (padding)
```

---

## ⌨️ Import Cheatsheet

```tsx
// All at once
import {
  Button,
  IconButton,
  Input,
  TextArea,
  Heading,
  Text,
  Label,
  Card,
  CardHeader,
  CardFooter,
  Badge,
  StatusBadge,
  Avatar,
  AvatarGroup
} from '@/components/ui';

// Individual imports
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
```

---

## 💡 Pro Tips

1. **Use `fullWidth`** on mobile forms
2. **Use `variant="success"`** for primary CTAs (green gradient)
3. **Use `isLoading`** for async operations
4. **Combine Card + CardHeader + CardFooter** for complex layouts
5. **Use `variant="interactive"`** for clickable cards
6. **Use AvatarGroup** to save space with many users
7. **Add `error` prop** to show validation errors
8. **Use `ghost` variant** for back/cancel buttons

---

## 🚀 Quick Start Template

```tsx
import { Button, Input, Card, Heading, Text } from '@/components/ui';

function MyComponent() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Heading level="h1">Page Title</Heading>
        <Text variant="body" color="muted">
          Page description
        </Text>
      </div>

      {/* Content */}
      <Card>
        <Heading level="h3" className="mb-4">
          Section Title
        </Heading>
        
        <Input
          label="Field Label"
          placeholder="Enter value..."
          fullWidth
        />
        
        <Button variant="primary" fullWidth className="mt-4">
          Submit
        </Button>
      </Card>
    </div>
  );
}
```

---

Happy coding! 🎉
