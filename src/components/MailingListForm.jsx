import { useEffect, useRef, useState } from "react";
import { EventType, useRive } from "@rive-app/react-canvas";
import { RiveCanvasEnums } from "../enums/rive-events.enums";
import TypingCursor from "./TypingCursor";
import { AuthApiServices } from "../services/apis/auth.api.services";
import { Toast } from "primereact/toast";

let isInputFocused = false;
let inputValue = "";
let animtionStateInput = null;

export function MailingListForm() {
  const toast = useRef(null);

  const { rive, RiveComponent } = useRive({
    src: "mailing_list_signup.riv",
    artboard: "Mailing List",
    stateMachines: ["MainSM"],
    autoplay: true,
    useDevicePixelRatio: true,
  });

  const [cursorState, setCursorState] = useState({
    textWidth: 0,
    text: "",
    showCursor: false,
  });

  const showInputCursor = () => {
    if (inputValue.length === 0) {
      rive.setTextRunValue("txtMailInput", "");
    }

    inputValue = rive.getTextRunValue("txtMailInput");

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: inputValue,
    });
  };

  // const hideInputCursor = () => {
  //   // hideInputCursorInput.fire();

  //   setCursorState({
  //     ...cursorState,
  //     showCursor: false,
  //   });
  // };

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    rive.setTextRunValue("txtMailInput", value);

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: value,
    });
  };

  const showYesNoView = () => {
    if (!animtionStateInput) return;

    animtionStateInput.value = 1;
  };

  const showEmailForm = () => {
    if (!animtionStateInput) return;

    animtionStateInput.value = 0;
  };

  const resendVerificationEmail = async () => {
    let email = rive.getTextRunValue("txtMailInput");

    email = email.toLocaleLowerCase();

    const res = await AuthApiServices.resendVerificationEmail({
      email,
    });

    let error = res.error;
    const errorMessage = res.data?.error;

    if (!error) {
      toast.current.show({
        severity: "success",
        summary: "Email sent!",
        detail:
          "Verfification email is sent on your email, please check your inbox!",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });

      showEmailForm();

      return;
    }

    toast.current.show({
      severity: "error",
      summary: "Failed while sending email!",
      detail:
        errorMessage ??
        "Something went wrong while sending verification email!",
      life: 3000,
    });
  };

  const removeEmail = async () => {
    let email = rive.getTextRunValue("txtMailInput");

    email = email.toLocaleLowerCase();

    const res = await AuthApiServices.removeAccount({
      email,
    });

    let error = res.error;
    const errorMessage = res.data?.error;

    if (!error) {
      toast.current.show({
        severity: "success",
        summary: "Account is removed!",
        detail: "Your account is removed successfully!",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });

      showEmailForm();

      return;
    }

    toast.current.show({
      severity: "error",
      summary: "Something went wrong!",
      detail:
        errorMessage ?? "Something went wrong while removing account details!",
      life: 3000,
    });

    showEmailForm();
  };

  const handleRemoveEmail = ({ remove = false }) => {
    if (remove) {
      removeEmail();
      return;
    }

    showEmailForm();
  };

  const showResendRemoveForm = () => {
    if (!animtionStateInput) return;

    animtionStateInput.value = 2;
  };

  const submitForm = async () => {
    let email = rive.getTextRunValue("txtMailInput");

    email = email.toLocaleLowerCase();

    if (!email) {
      toast.current.show({
        severity: "error",
        summary: "Email validation failed!",
        detail: "Email is required. Please enter valid email address!",
        life: 3000,
      });
    }

    const res = await AuthApiServices.verifyEmail({
      email: email,
    });

    const isUserExists = res.data?.exists;
    const isError = res.data?.error;
    const isVerified = Boolean(res.data?.verified);
    const isEmailValid = res.data?.email_validation;

    if (isUserExists && isVerified) {
      showYesNoView();

      toast.current.show({
        severity: "success",
        summary: "Email Already Found",
        detail:
          "Email Already Found! Do you wish to remove your email from our mailing list system?",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
      return;
    }

    if (isUserExists && !isVerified) {
      showResendRemoveForm();

      toast.current.show({
        severity: "success",
        summary: "Email Already Found But Not Verified",
        detail:
          "Email Already Found But Not Verified! Do you wish to resend the verification request or remove your email from our system?",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
      return;
    }

    if (!isUserExists && !isVerified) {
      showResendRemoveForm();

      toast.current.show({
        severity: "success",
        summary: "Registration successfully",
        detail:
          "Thank you for your Submission; please check your email to Verify your Registration.",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
      return;
    }

    if (!isEmailValid) {
      toast.current.show({
        severity: "error",
        summary: "Email validation failed!",
        detail:
          isError ?? "Email is not valid. Please enter valid email address!",
        life: 3000,
      });

      return;
    }

    if (isError) {
      toast.current.show({
        severity: "error",
        summary: "Failed!",
        detail: isError ?? "Something went wrong while working on email!",
        life: 3000,
      });

      return;
    }

    if (isUserExists) {
      showYesNoView();

      toast.current.show({
        severity: "success",
        summary: "Registratoin successfully",
        detail:
          "Email Already Found! Do you wish to remove your email from our mailing list system?",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
    }

    if (!isUserExists) {
      showYesNoView();

      toast.current.show({
        severity: "info",
        summary: "Registratoin successfully",
        detail: isError ?? "Please verify your email address",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
    }
  };

  const handleRiveEvent = (event) => {
    let eventname = event?.data?.name;

    console.log("eventname", eventname);

    const animState = animtionStateInput.value;

    if (eventname === RiveCanvasEnums.listeners.txtFiedMouseDown) {
      isInputFocused = true;
      showInputCursor();
      return;
    }

    if (eventname === RiveCanvasEnums.listeners.btnSubmitClick) {
      isInputFocused = false;
      submitForm();
      return;
    }

    // Event triggers on resend email button as well
    if (eventname === RiveCanvasEnums.listeners.btnYesClick) {
      isInputFocused = false;

      handleRemoveEmail({
        remove: true,
      });

      return;
    }

    if (eventname === RiveCanvasEnums.listeners.btnNoClick) {
      isInputFocused = false;

      if (animState == 2) {
        resendVerificationEmail({
          remove: true,
        });

        return;
      }

      showEmailForm();

      return;
    }
  };

  const handleKeyChange = (event) => {
    let key = event.key;

    let code = event.code;

    if (code?.includes("Key")) {
      key = code?.[code.length - 1];
    }

    if (key.length == 1) {
      inputValue = inputValue + "" + key;
    }

    const keyCode = event.keyCode || event.charCode;

    if (keyCode == 8 || keyCode == 46) {
      inputValue = inputValue?.slice(0, -1);
    }

    setValueToEmailInput(inputValue);
  };

  useEffect(() => {
    if (!rive) return;

    const inputs = rive.stateMachineInputs("MainSM");
    // const names = rive.stateMachineNames;
    console.log("inputs", inputs);

    // console.log("names", names);

    inputs.forEach((input) => {
      if (input.name === RiveCanvasEnums.inputs.animState) {
        animtionStateInput = input;
      }
    });

    // inputValue = rive.getTextRunValue("txtMailInput");

    console.log("inputValue", inputValue);
    // showInputCursorInput =

    // hideInputCursorInput =

    // console.log("showInputCursorInput", showInputCursorInput);
    // console.log("hideInputCursorInput", hideInputCursorInput);

    rive.on(EventType.RiveEvent, handleRiveEvent);

    window.addEventListener("keydown", handleKeyChange);
  }, [rive]);

  useEffect(() => {
    var test = document.getElementById("hiddle-text-container");
    // var height = test.clientHeight + 1;
    var width = test.clientWidth + 1;

    setCursorState({
      ...cursorState,
      textWidth: width,
    });

    // console.log("text-width", width);
  }, [cursorState.text]);

  return (
    <>
      <div className="rive-component-container">
        <RiveComponent />

        <div id="hiddle-text-container">{cursorState.text}</div>
      </div>

      <TypingCursor
        textWidth={cursorState?.textWidth ?? 0}
        showCursor={cursorState.showCursor}
      />

      <Toast ref={toast} />
    </>
  );
}
