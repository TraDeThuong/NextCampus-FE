import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

import {
    createApplication,
    CreateApplicationPayload,
} from "@/services/application.service";

type ErrorResponse = {
    message: string;
};

export function useCreateApplication() {
    return useMutation({
        mutationFn: createApplication,

        onSuccess: () => {
            toast.success("Application created successfully!");
        },

        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(
                error.response?.data?.message ??
                "Failed to create application."
            );
        },
    });
}