WieWeb::Application.routes.draw do
  root 'home#index'
  resources :home, :only => [:index]
end
