"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ageGroupSchema, AgeGroupFormData } from "../schemas/roadmapSchemas";
import { AgeGroup, AgeGroupContentValidationResult, AgeGroupStatus } from "@shared/types";
import { validateAgeGroupReadinessAction } from "@/src/lib/content-service/server-actions";
import { AgeGroupReadinessChecker } from "./AgeGroupReadinessChecker";

interface AgeGroupFormProps {
  ageGroup?: AgeGroup;
  onSubmit: (data: AgeGroupFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function AgeGroupForm({
  ageGroup,
  onSubmit,
  isLoading = false,
  onCancel,
}: AgeGroupFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    ageGroup?.status || AgeGroupStatus.INACTIVE
  );
  const [validationResult, setValidationResult] = useState<AgeGroupContentValidationResult | undefined>(undefined);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AgeGroupFormData>({
    resolver: zodResolver(ageGroupSchema),
    defaultValues: ageGroup
      ? {
          name: ageGroup.name,
          minAge: ageGroup.minAge,
          maxAge: ageGroup.maxAge,
          status: ageGroup.status,
        }
      : {
          name: "",
          minAge: 1,
          maxAge: 1,
          status: AgeGroupStatus.INACTIVE,
        },
  });

  // When status changes to ACTIVE, validate content completeness
  useEffect(() => {
    const validateIfNeeded = async () => {
      if (
        selectedStatus === AgeGroupStatus.ACTIVE &&
        ageGroup?.id
      ) {
        setIsValidating(true);
        setValidationError(null);
        const result = await validateAgeGroupReadinessAction(ageGroup.id);

        if (!result.success) {
          setValidationError(result.error);
          setValidationResult(undefined);
        } else {
          setValidationResult(result.data);
          setValidationError(null);
        }
        setIsValidating(false);
      } else {
        setValidationResult(undefined);
        setValidationError(null);
      }
    };

    validateIfNeeded();
  }, [selectedStatus, ageGroup?.id]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setValue("status", value as AgeGroupStatus);
  };

  const isReadyToActivate =
    selectedStatus === AgeGroupStatus.ACTIVE &&
    validationResult &&
    validationResult.isComplete;

  const shouldBlockSubmit =
    isLoading ||
    (selectedStatus === AgeGroupStatus.ACTIVE &&
      (!validationResult || !validationResult.isComplete || isValidating));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-medium mb-4">Age Group Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Age Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., 6-7 years"
              {...register("name")}
              className="mt-1"
            />
            {errors.name && (
              <span className="text-xs text-red-600 mt-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAge">Minimum Age</Label>
              <Input
                id="minAge"
                type="number"
                min="1"
                {...register("minAge", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.minAge && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.minAge.message}
                </span>
              )}
            </div>

            <div>
              <Label htmlFor="maxAge">Maximum Age</Label>
              <Input
                id="maxAge"
                type="number"
                min="1"
                {...register("maxAge", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.maxAge && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.maxAge.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={handleStatusChange}
              disabled={!ageGroup} // Disable status change during creation
            >
              <SelectTrigger 
                id="status" 
                className="mt-1"
                disabled={!ageGroup}
              >
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {ageGroup ? (
                  <>
                    <SelectItem value={AgeGroupStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={AgeGroupStatus.INACTIVE}>Inactive</SelectItem>
                  </>
                ) : (
                  <SelectItem value={AgeGroupStatus.INACTIVE}>Inactive (Default)</SelectItem>
                )}
              </SelectContent>
            </Select>
            {!ageGroup && (
              <p className="text-xs text-slate-500 mt-1">
                New age groups are created as inactive. Update after creation to activate.
              </p>
            )}
            {errors.status && (
              <span className="text-xs text-red-600 mt-1">
                {errors.status.message}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Content Readiness Checker */}
      {selectedStatus === AgeGroupStatus.ACTIVE && ageGroup?.id && (
        <AgeGroupReadinessChecker
          validationResult={validationResult}
          isLoading={isValidating}
          error={validationError}
        />
      )}


      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={shouldBlockSubmit}>
          {isLoading
            ? "Saving..."
            : ageGroup
              ? "Update Age Group"
              : "Create Age Group"}
        </Button>
      </div>
    </form>
  );
}
