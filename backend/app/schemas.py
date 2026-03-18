from typing import Literal, Optional, List, Dict, Any

from pydantic import BaseModel, Field

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AIChange(BaseModel):
    field: str
    value: Any
    description: Optional[str] = None

class AIResponse(BaseModel):
    type: Literal["settings", "weapons", "characters", "maps", "scripts"]
    changes: List[AIChange]

class AIPromptRequest(BaseModel):
    prompt: str
    project_id: Optional[int] = None

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# Mod structures
class SettingsModel(BaseModel):
    difficulty: Literal["easy", "normal", "hard"] = "normal"
    maxPlayers: int = Field(10, ge=1, le=128)
    timeLimit: int = Field(300, ge=0, le=3600)
    friendlyFire: bool = False
    respawnTime: int = Field(5, ge=0, le=300)

class WeaponModel(BaseModel):
    name: str
    damage: float = Field(50, ge=0, le=1000)
    fireRate: float = Field(1, ge=0)
    recoil: float = Field(0.1, ge=0, le=1)
    ammoCapacity: int = Field(30, ge=0)
    reloadTime: float = Field(2, ge=0)

class CharacterModel(BaseModel):
    name: str
    health: float = Field(100, ge=1, le=1000)
    speed: float = Field(10, ge=0, le=500)
    jumpHeight: float = Field(5, ge=0, le=100)
    armor: float = Field(0, ge=0, le=1000)

class MapModel(BaseModel):
    name: str
    size: Dict[str, float]
    gravity: float = Field(9.8, ge=0, le=100)
    lighting: Literal["day", "night", "dusk"] = "day"

class ScriptModel(BaseModel):
    name: str
    content: str

class ModData(BaseModel):
    settings: Optional[SettingsModel] = None
    weapons: Optional[List[WeaponModel]] = None
    characters: Optional[List[CharacterModel]] = None
    maps: Optional[List[MapModel]] = None
    scripts: Optional[List[ScriptModel]] = None

class ModDataResponse(ModData):
    project_id: int

