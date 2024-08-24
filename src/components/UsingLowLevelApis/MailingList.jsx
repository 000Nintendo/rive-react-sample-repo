import "./styles/MailingList.scss";

import React, { useEffect, useRef, useState } from "react";
import InputTypingCursor from "./InputTypingCursor";
import { Layout } from "@rive-app/react-canvas";
import { RiveServices } from "../../services/rive.services";
import { RiveCanvasEnums } from "../../enums/rive-events.enums";
import { Toast } from "primereact/toast";
import { AuthApiServices } from "../../services/apis/auth.api.services";

let isInputFocused = false;
let inputValue = "";
let ctx, renderer, requestId, artboard, stateMachine;
let instances = {
  emailInput: null,
  animState: 0,
};

const MailingList = () => {
  const canvas = useRef(null);
  const container = useRef(null);
  const toast = useRef(null);

  const [cursorState, setCursorState] = useState({
    textWidth: 0,
    text: "",
    showCursor: false,
  });

  const showInputCursor = () => {
    if (inputValue.length === 0) {
      instances.emailInput.text = "";
    }

    inputValue = instances.emailInput.text;

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: inputValue,
    });
  };

  const setValueToEmailInput = (value) => {
    if (!isInputFocused) return;
    instances.emailInput.text = value;

    setCursorState({
      ...cursorState,
      showCursor: true,
      text: value,
    });
  };

  const resize = () => {
    if (container.current && canvas.current) {
      const { width, height } = container.current.getBoundingClientRect();
      canvas.current.width = width;
      canvas.current.height = height;
    }
  };

  const showYesNoView = () => {
    instances.animState.asNumber().value = 1;
  };

  const showEmailForm = () => {
    instances.animState.asNumber().value = 0;
  };

  const showResendRemoveForm = () => {
    instances.animState.asNumber().value = 2;
  };

  const submitForm = async () => {
    let email = instances.emailInput.text;

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
        summary: "Registration successfully",
        detail: isError ?? "Please verify your email address",
        life: 3000,
      });

      setCursorState({
        ...cursorState,
        showCursor: false,
      });
    }
  };

  const removeEmail = async () => {
    let email = instances.emailInput.text;

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

  const resendVerificationEmail = async () => {
    let email = instances.emailInput.text;

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

  const handleRemoveEmail = ({ remove = false }) => {
    if (remove) {
      removeEmail();
      return;
    }

    showEmailForm();
  };

  const handleRiveEvent = (event) => {
    let eventname = event?.name;

    console.log("eventname", eventname);

    const animState = instances.animState.asNumber().value;

    console.log("animState", animState);

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
    const setCanvas = async (canvas) => {
      if (!canvas) {
        return;
      }

      const { rive, file_buffer } = await RiveServices.loadRive(
        "mailing_list_signup.riv"
      );

      let file = await rive.load(new Uint8Array(file_buffer));

      artboard = file.artboardByName("Mailing List");
      stateMachine = new rive.StateMachineInstance(
        artboard.stateMachineByName("MainSM"),
        artboard
      );
      const animation = new rive.LinearAnimationInstance(
        artboard.animationByName("MainSM"),
        artboard
      );

      instances.emailInput = artboard.textRun("txtMailInput");

      const inputsCount = stateMachine.inputCount();

      for (let i = 0; i < inputsCount; i++) {
        const input = stateMachine.input(i);
        if (input.name === RiveCanvasEnums.inputs.animState) {
          instances.animState = input;
        }
      }

      if (instances?.animState?.asNumber) {
        instances.animState.asNumber().value = 0;
      }

      let layout = new Layout();

      ctx = canvas.getContext("2d", { alpha: true });
      renderer = rive.makeRenderer(canvas);
      artboard.advance(0);
      artboard.draw(renderer);

      RiveServices.setupRiveListeners({
        riveListenerOptions: {},
        artboard: artboard,
        canvas,
        layout,
        renderer,
        rive,
        stateMachines: [stateMachine],
      });

      let lastTime = 0;

      function renderLoop(time) {
        if (!lastTime) {
          lastTime = time;
        }
        const elapsedTimeMs = time - lastTime;
        const elapsedTimeSec = elapsedTimeMs / 1000;
        lastTime = time;

        renderer.clear();

        if (artboard) {
          if (animation) {
            animation.advance(elapsedTimeSec);
            animation.apply(1);
          }

          if (stateMachine) {
            const numFiredEvents = stateMachine.reportedEventCount();
            for (let i = 0; i < numFiredEvents; i++) {
              const event = stateMachine.reportedEventAt(i);
              handleRiveEvent(event);
            }
          }

          stateMachine.advance(elapsedTimeSec);
          artboard.advance(elapsedTimeSec);
          renderer.save();
          renderer.align(
            rive.Fit.contain,
            rive.Alignment.center,
            {
              minX: 0,
              minY: 0,
              maxX: canvas.width,
              maxY: canvas.height,
            },
            artboard.bounds
          );
          artboard.draw(renderer);
          renderer.restore();
        }
        requestId = rive.requestAnimationFrame(renderLoop);
      }
      requestId = rive.requestAnimationFrame(renderLoop);
    };

    setCanvas(canvas.current);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => focus(e));
    window.addEventListener("keydown", handleKeyChange);

    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", (e) => focus(e));
      window.removeEventListener("keydown", handleKeyChange);
    };
  }, []);

  useEffect(() => {
    var textContainer = document.getElementById("hidden-text-container");
    var width = textContainer.clientWidth + 1;

    setCursorState({
      ...cursorState,
      textWidth: width,
    });
  }, [cursorState.text]);

  return (
    <div>
      <div ref={container} className="email-form-container">
        <canvas ref={canvas} id="email-form-canvas" />
      </div>

      <div id="hidden-text-container">{cursorState.text}</div>

      <InputTypingCursor
        showCursor={cursorState.showCursor}
        textWidth={cursorState.textWidth}
      />

      <Toast ref={toast} />
    </div>
  );
};

export default MailingList;
