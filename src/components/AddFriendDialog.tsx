
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().min(5).email("Must be a valid email"),
});

type FormType = z.infer<typeof schema>;

export default function AddFriendDialog({ onAdd }: { onAdd?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const handleInvite = async (data: FormType) => {
    setLoading(true);
    
    try {
      // First try to find user in profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,email")
        .eq("email", data.email)
        .maybeSingle();

      if (!profile) {
        toast({ 
          title: "User not found", 
          description: "No user with that email address has signed up yet.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const requesterId = (await supabase.auth.getUser()).data?.user?.id;
      if (!requesterId) {
        toast({ title: "Not authenticated", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (profile.id === requesterId) {
        toast({ title: "Cannot add yourself as a friend", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Check if friendship already exists (in either direction)
      const { data: existingFriendship } = await supabase
        .from("friends")
        .select("id, status")
        .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${requesterId})`)
        .maybeSingle();

      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          toast({
            title: "Already friends",
            description: "You are already friends with this user.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Friend request already exists",
            description: "A friend request already exists between you and this user.",
            variant: "destructive"
          });
        }
        setLoading(false);
        return;
      }

      // Create friend request
      const { error } = await supabase.from("friends").insert({
        requester_id: requesterId,
        addressee_id: profile.id,
        status: "pending",
      });

      if (error) {
        console.error("Friend request error:", error);
        toast({
          title: "Error sending request",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Friend request sent successfully!" });
        onAdd?.();
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">Add Friend</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Friend</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleInvite)}
            className="space-y-4"
            autoComplete="off"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Friend's email address" />
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
                disabled={!form.formState.isValid || loading}
              >
                {loading ? "Sending..." : "Send Friend Request"}
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
