import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  avatar: z.string().url("Must be a valid image URL"),
});

type ProfileForm = z.infer<typeof profileSchema>;

type EditProfileDialogProps = {
  current: ProfileForm;
  onSave: (data: ProfileForm) => void; // <- ensure all required
};

export default function EditProfileDialog({ current, onSave }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: current,
    mode: "onChange",
  });

  React.useEffect(() => {
    form.reset(current);
  }, [open, current]);

  function onSubmit(data: ProfileForm) {
    onSave(data);
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated.",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Email" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Profile picture URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant="default"
                className="glass border-2 border-blue-400 text-blue-50 font-bold tracking-wide rounded-full shadow-glass"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
              >
                Save Changes
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
