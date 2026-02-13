import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { LoginForm } from "./login-form";
import { Button } from "../ui/button";
export default function Login() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button id="about">
          Login
        </Button>
      </DialogTrigger>
      <DialogTitle></DialogTitle>

      <DialogContent className=" " showCloseButton={false}>
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
