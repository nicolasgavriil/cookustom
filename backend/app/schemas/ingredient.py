from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.ingredient import IngredientUnit


class IngredientCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    unit: IngredientUnit
    calories_per_unit: Decimal = Field(ge=0, max_digits=10, decimal_places=4)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Name cannot be empty")
        return name


class IngredientUpdateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    unit: IngredientUnit
    calories_per_unit: Decimal = Field(ge=0, max_digits=10, decimal_places=4)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Name cannot be empty")
        return name


class IngredientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    unit: IngredientUnit
    calories_per_unit: Decimal
    created_at: datetime
